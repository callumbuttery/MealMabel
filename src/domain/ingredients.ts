import type {
  IngredientRequirement,
  IngredientUnit,
  ShoppingList,
  WeeklyPlan,
} from '@/domain/models';

interface NormalizedQuantity {
  quantity: number;
  unit: IngredientUnit;
}

const PRECISION = 1000;

function normalizeQuantity(quantity: number, unit: IngredientUnit): NormalizedQuantity {
  switch (unit) {
    case 'kg':
      return { quantity: quantity * 1000, unit: 'g' };
    case 'l':
      return { quantity: quantity * 1000, unit: 'ml' };
    default:
      return { quantity, unit };
  }
}

function roundQuantity(quantity: number): number {
  return Math.round(quantity * PRECISION) / PRECISION;
}

export function aggregateIngredientRequirements(
  plan: WeeklyPlan,
): IngredientRequirement[] {
  const requirements = new Map<string, IngredientRequirement>();

  for (const day of plan.days) {
    for (const meal of day.meals) {
      const servingMultiplier = meal.servings / meal.recipe.servings;

      for (const ingredient of meal.recipe.ingredients) {
        if (ingredient.optional) {
          continue;
        }

        const normalized = normalizeQuantity(
          ingredient.quantity * servingMultiplier,
          ingredient.unit,
        );
        const key = `${ingredient.ingredientId}:${normalized.unit}`;
        const current = requirements.get(key);

        requirements.set(key, {
          ingredientId: ingredient.ingredientId,
          name: ingredient.name,
          unit: normalized.unit,
          quantity: roundQuantity((current?.quantity ?? 0) + normalized.quantity),
        });
      }
    }
  }

  return [...requirements.values()].sort((left, right) =>
    left.name.localeCompare(right.name),
  );
}

export function createShoppingList(plan: WeeklyPlan): ShoppingList {
  return {
    id: `shopping-${plan.id}`,
    planId: plan.id,
    createdAt: plan.generatedAt,
    items: aggregateIngredientRequirements(plan).map((requirement) => ({
      ...requirement,
      checked: false,
    })),
  };
}
