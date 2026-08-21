import { blockedAllergensForRequest, recipeContainsBlockedAllergen } from '@/domain/allergens';
import type { PlanRequest, Recipe, WeeklyPlan } from '@/domain/models';

export interface ConstraintViolation {
  code:
    | 'INVALID_HOUSEHOLD'
    | 'INVALID_TARGET'
    | 'INVALID_BUDGET'
    | 'INVALID_MEALS'
    | 'DIET'
    | 'EXCLUDED_INGREDIENT'
    | 'ALLERGEN'
    | 'COOKING_TIME';
  message: string;
}

export function validatePlanRequest(request: PlanRequest): ConstraintViolation[] {
  const violations: ConstraintViolation[] = [];

  const memberCountMismatch =
    request.household.memberCount < 1 ||
    request.household.adultCount + request.household.childCount !== request.household.memberCount;
  const peopleMismatch =
    request.household.members.length !== request.household.memberCount ||
    request.household.members.filter((member) => member.kind === 'adult').length !==
      request.household.adultCount ||
    request.household.members.filter((member) => member.kind === 'child').length !==
      request.household.childCount;
  if (memberCountMismatch || peopleMismatch) {
    violations.push({
      code: 'INVALID_HOUSEHOLD',
      message: 'Household people must match the adult and child counts.',
    });
  }
  if (request.preferences.dailyCalorieTarget <= 0 || request.preferences.dailyProteinTargetG <= 0) {
    violations.push({
      code: 'INVALID_TARGET',
      message: 'Calorie and protein targets must be greater than zero.',
    });
  }
  if (request.preferences.maximumWeeklyBudget <= 0) {
    violations.push({
      code: 'INVALID_BUDGET',
      message: 'Weekly budget must be greater than zero.',
    });
  }
  if (
    request.mealsPerDay.length === 0 ||
    new Set(request.mealsPerDay).size !== request.mealsPerDay.length
  ) {
    violations.push({
      code: 'INVALID_MEALS',
      message: 'At least one unique meal type must be requested.',
    });
  }

  return violations;
}

function recipeMatchesDiet(recipe: Recipe, request: PlanRequest): boolean {
  const configuredDiet =
    request.preferences.dietType ??
    request.preferences.dietaryPreferences.find((diet) => diet !== 'none') ??
    'anything';
  const diet = configuredDiet.replaceAll('-', '_');
  if (diet === 'anything' || diet === 'none') return true;
  if (diet === 'vegan') return recipe.tags.includes('vegan');
  if (diet === 'vegetarian') {
    return recipe.tags.some((tag) => tag === 'vegetarian' || tag === 'vegan');
  }
  if (diet === 'pescatarian') {
    return recipe.tags.some((tag) => ['pescatarian', 'vegetarian', 'vegan'].includes(tag));
  }
  return true;
}

export function validateRecipeHardConstraints(
  recipe: Recipe,
  request: PlanRequest,
): ConstraintViolation[] {
  const violations: ConstraintViolation[] = [];
  const exclusions = request.preferences.excludedIngredients.map(normalise).filter(Boolean);
  const allergens = blockedAllergensForRequest(request);

  if (!recipeMatchesDiet(recipe, request)) {
    violations.push({
      code: 'DIET',
      message: `${recipe.name} does not match the household diet.`,
    });
  }
  if (
    exclusions.some((excluded) =>
      recipe.ingredients.some(
        (ingredient) =>
          normalise(ingredient.ingredientId).includes(excluded) ||
          normalise(ingredient.name).includes(excluded),
      ),
    )
  ) {
    violations.push({
      code: 'EXCLUDED_INGREDIENT',
      message: `${recipe.name} contains an excluded ingredient.`,
    });
  }
  if (recipeContainsBlockedAllergen(recipe, allergens)) {
    violations.push({
      code: 'ALLERGEN',
      message: `${recipe.name} contains a household allergen.`,
    });
  }

  return violations;
}

function normalise(value: string): string {
  return value.toLowerCase().replaceAll('-', ' ').trim();
}

export function validateRecipeConstraints(
  recipe: Recipe,
  request: PlanRequest,
): ConstraintViolation[] {
  const violations = validateRecipeHardConstraints(recipe, request);
  if (
    recipe.prepTimeMinutes + recipe.cookTimeMinutes >
    request.preferences.cookingTimeLimitMinutes
  ) {
    violations.push({
      code: 'COOKING_TIME',
      message: `${recipe.name} exceeds the cooking time limit.`,
    });
  }

  return violations;
}

export function validatePlanConstraints(
  plan: WeeklyPlan,
  request: PlanRequest,
): ConstraintViolation[] {
  return [
    ...validatePlanRequest(request),
    ...plan.days.flatMap((day) =>
      day.meals.flatMap((meal) => validateRecipeConstraints(meal.recipe, request)),
    ),
  ];
}
