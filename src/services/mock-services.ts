import { buildRetailerBasket, compareRetailers } from '@/domain/basket-optimizer';
import {
  validatePlanRequest,
  validateRecipeConstraints,
  validateRecipeHardConstraints,
} from '@/domain/constraints';
import { createShoppingList } from '@/domain/ingredients';
import type {
  GroceryProduct,
  IngredientRequirement,
  Meal,
  MealSwapRequest,
  MealType,
  PlanDay,
  PlanModificationRequest,
  PlanRequest,
  ProductSelectionOverrides,
  RetailerComparison,
  RetailerId,
  RetailerBasket,
  ShoppingList,
  WeeklyPlan,
} from '@/domain/models';
import { calculateDayNutrition, calculatePlanNutrition } from '@/domain/nutrition';
import { SEEDED_GROCERY_CATALOGUE } from '@/fixtures/catalogue';
import { SEEDED_RECIPES } from '@/fixtures/recipes';
import { SEEDED_WEEKLY_PLAN } from '@/fixtures/weekly-plan';
import type {
  BasketService,
  GroceryCatalogService,
  GroceryCatalogueService,
  MealPlanningService,
  ShoppingService,
} from '@/services/interfaces';

export interface MockServiceOptions {
  delayMs?: number;
}

export class NoSafePlanError extends Error {
  public readonly code = 'NO_SAFE_RECIPES';

  public constructor(public readonly mealTypes: MealType[]) {
    super('NO_SAFE_RECIPES');
    this.name = 'NoSafePlanError';
  }
}

const DAY_MS = 24 * 60 * 60 * 1000;

function wait(delayMs: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, delayMs));
}

function dateAtOffset(startDate: string, offset: number): string {
  const date = new Date(`${startDate}T00:00:00.000Z`);
  date.setTime(date.getTime() + offset * DAY_MS);
  return date.toISOString().slice(0, 10);
}

function rebuildPlan(plan: WeeklyPlan, days: PlanDay[]): WeeklyPlan {
  const rebuiltDays = days.map((day) => ({
    ...day,
    nutrition: calculateDayNutrition(day.meals),
  }));
  return {
    ...plan,
    days: rebuiltDays,
    nutrition: calculatePlanNutrition(rebuiltDays),
  };
}

function updateMeal(
  plan: WeeklyPlan,
  date: string,
  mealId: string,
  update: (meal: Meal) => Meal | null,
): WeeklyPlan {
  let matched = false;
  const days = plan.days.map((day) => {
    if (day.date !== date) {
      return day;
    }
    const meals = day.meals.flatMap((meal) => {
      if (meal.id !== mealId) {
        return [meal];
      }
      matched = true;
      const updated = update(meal);
      return updated ? [updated] : [];
    });
    return { ...day, meals };
  });

  if (!matched) {
    throw new Error(`Meal ${mealId} was not found on ${date}.`);
  }
  return rebuildPlan(plan, days);
}

export class MockMealPlanningService implements MealPlanningService {
  private readonly delayMs: number;

  public constructor(options: MockServiceOptions = {}) {
    this.delayMs = options.delayMs ?? 250;
  }

  public async generatePlan(request: PlanRequest): Promise<WeeklyPlan> {
    await wait(this.delayMs);
    const violations = validatePlanRequest(request);
    if (violations.length > 0) {
      throw new Error(violations.map((violation) => violation.message).join(' '));
    }

    const allowedRecipes = new Map(
      request.mealsPerDay.map((mealType) => [
        mealType,
        SEEDED_RECIPES.filter(
          (recipe) =>
            recipe.mealTypes.includes(mealType) &&
            validateRecipeHardConstraints(recipe, request).length === 0,
        ),
      ]),
    );
    const missingMealTypes = request.mealsPerDay.filter(
      (mealType) => allowedRecipes.get(mealType)?.length === 0,
    );
    if (missingMealTypes.length > 0) {
      throw new NoSafePlanError(missingMealTypes);
    }

    const days = SEEDED_WEEKLY_PLAN.days
      .slice(0, request.durationDays ?? 7)
      .map((seedDay, dayIndex) => {
        const date = dateAtOffset(request.weekStarting, dayIndex);
        const meals = seedDay.meals
          .filter((meal) => request.mealsPerDay.includes(meal.type))
          .map((meal, mealIndex) => {
            const seedIsAllowed = validateRecipeHardConstraints(meal.recipe, request).length === 0;
            const candidates = allowedRecipes.get(meal.type) ?? [];
            const recipe = seedIsAllowed
              ? meal.recipe
              : candidates[(dayIndex + mealIndex) % candidates.length];
            return {
              ...meal,
              id: `${date}-${meal.type}`,
              recipe,
              servings: request.household.memberCount,
            };
          });
        return {
          ...seedDay,
          date,
          meals,
          nutrition: calculateDayNutrition(meals),
        };
      });
    return {
      ...SEEDED_WEEKLY_PLAN,
      id: `plan-${request.weekStarting}`,
      weekStarting: request.weekStarting,
      householdServings: request.household.memberCount,
      generatedAt: new Date().toISOString(),
      days,
      nutrition: calculatePlanNutrition(days),
    };
  }

  public async swapMeal(plan: WeeklyPlan, request: MealSwapRequest): Promise<WeeklyPlan> {
    await wait(this.delayMs);
    if (request.planId !== plan.id) {
      throw new Error('Swap request does not match the supplied plan.');
    }

    return updateMeal(plan, request.date, request.mealId, (meal) => {
      const replacement = request.replacementRecipeId
        ? SEEDED_RECIPES.find((recipe) => recipe.id === request.replacementRecipeId)
        : SEEDED_RECIPES.find(
            (recipe) => recipe.id !== meal.recipe.id && recipe.mealTypes.includes(meal.type),
          );
      if (!replacement || !replacement.mealTypes.includes(meal.type)) {
        throw new Error('No suitable replacement recipe was found.');
      }
      return { ...meal, recipe: replacement };
    });
  }

  public async modifyPlan(plan: WeeklyPlan, request: PlanModificationRequest): Promise<WeeklyPlan> {
    await wait(this.delayMs);
    if (request.planId !== plan.id) {
      throw new Error('Modification request does not match the supplied plan.');
    }

    let modified = plan;
    for (const modification of request.modifications) {
      if (modification.type === 'swap-meal') {
        modified = await this.swapMeal(modified, modification.request);
      } else if (modification.type === 'remove-meal') {
        modified = updateMeal(modified, modification.date, modification.mealId, () => null);
      } else {
        if (modification.servings < 1) {
          throw new Error('Meal servings must be at least one.');
        }
        modified = updateMeal(modified, modification.date, modification.mealId, (meal) => ({
          ...meal,
          servings: modification.servings,
        }));
      }
    }
    return modified;
  }

  public recipesForRequest(request: PlanRequest): GroceryProduct[] {
    const allowedIngredientIds = new Set(
      SEEDED_RECIPES.filter(
        (recipe) => validateRecipeConstraints(recipe, request).length === 0,
      ).flatMap((recipe) => recipe.ingredients.map((ingredient) => ingredient.ingredientId)),
    );
    return SEEDED_GROCERY_CATALOGUE.filter((product) =>
      allowedIngredientIds.has(product.ingredientId),
    );
  }
}

export class MockShoppingService implements ShoppingService {
  private readonly delayMs: number;

  public constructor(options: MockServiceOptions = {}) {
    this.delayMs = options.delayMs ?? 150;
  }

  public async createList(plan: WeeklyPlan): Promise<ShoppingList> {
    await wait(this.delayMs);
    return createShoppingList(plan);
  }

  public async compareRetailers(
    requirements: IngredientRequirement[],
    selections: ProductSelectionOverrides = {},
  ): Promise<RetailerComparison> {
    await wait(this.delayMs);
    return compareRetailers(requirements, SEEDED_GROCERY_CATALOGUE, undefined, selections);
  }
}

export class MockGroceryCatalogueService implements GroceryCatalogueService {
  private readonly delayMs: number;

  public constructor(options: MockServiceOptions = {}) {
    this.delayMs = options.delayMs ?? 100;
  }

  public async getProducts(): Promise<GroceryProduct[]> {
    await wait(this.delayMs);
    return [...SEEDED_GROCERY_CATALOGUE];
  }

  public async getProductsForIngredient(ingredientId: string): Promise<GroceryProduct[]> {
    await wait(this.delayMs);
    return SEEDED_GROCERY_CATALOGUE.filter((product) => product.ingredientId === ingredientId);
  }
}

export class MockGroceryCatalogService
  extends MockGroceryCatalogueService
  implements GroceryCatalogService
{
  public async searchProducts(query: string, retailer: RetailerId): Promise<GroceryProduct[]> {
    const products = await this.getProducts();
    const normalized = query.trim().toLowerCase();
    return products.filter(
      (product) =>
        product.retailerId === retailer &&
        (product.name.toLowerCase().includes(normalized) ||
          product.ingredientId.includes(normalized)),
    );
  }
}

export class MockBasketService implements BasketService {
  public constructor(private readonly options: MockServiceOptions = {}) {}

  public async buildBasket(plan: WeeklyPlan, retailer: RetailerId): Promise<RetailerBasket> {
    await wait(this.options.delayMs ?? 150);
    return buildRetailerBasket(retailer, createShoppingList(plan).items, SEEDED_GROCERY_CATALOGUE);
  }

  public async compareRetailers(
    plan: WeeklyPlan,
    retailers: RetailerId[],
  ): Promise<RetailerComparison> {
    await wait(this.options.delayMs ?? 150);
    return compareRetailers(createShoppingList(plan).items, SEEDED_GROCERY_CATALOGUE, retailers);
  }
}
