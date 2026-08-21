import { estimateRecipeCostPerServing } from '@/domain/basket-optimizer';
import type { GroceryProduct, PlanRequest, Recipe } from '@/domain/models';

/** Ingredients that read as a fruit/veg portion, for a rough `five_a_day` signal. */
const VEG_FRUIT_INGREDIENT_IDS = new Set([
  'spinach',
  'broccoli',
  'peppers',
  'tomatoes',
  'chopped-tomatoes',
  'courgette',
  'peas',
  'berries',
  'banana',
]);

function vegFruitPortions(recipe: Recipe): number {
  return recipe.ingredients.filter((ingredient) =>
    VEG_FRUIT_INGREDIENT_IDS.has(ingredient.ingredientId),
  ).length;
}

function normalise(value: number, min: number, max: number): number {
  return max === min ? 0 : (value - min) / (max - min);
}

function range(values: number[]): { min: number; max: number } {
  return { min: Math.min(...values), max: Math.max(...values) };
}

/**
 * Orders safe recipe candidates for a meal slot by how well they match the household's soft
 * goals and cooking effort. Ties (no goals set, effort "normal") score zero for every recipe, so
 * the stable sort leaves the input order untouched — callers can use that to detect "no
 * preference" and keep the seeded week's variety instead of collapsing onto one "best" recipe.
 */
export function rankRecipesForRequest(
  recipes: readonly Recipe[],
  request: PlanRequest,
  catalogue: readonly GroceryProduct[],
): Recipe[] {
  if (recipes.length <= 1) {
    return [...recipes];
  }

  const goals = request.preferences.nutritionGoals ?? [];
  const effort = request.preferences.cookingEffort ?? 'normal';
  const metrics = recipes.map((recipe) => ({
    recipe,
    calories: recipe.nutritionPerServing.caloriesKcal,
    protein: recipe.nutritionPerServing.proteinG,
    fibre: recipe.nutritionPerServing.fibreG,
    vegFruit: vegFruitPortions(recipe),
    cost: estimateRecipeCostPerServing(recipe, [...catalogue]),
    timeMinutes: recipe.prepTimeMinutes + recipe.cookTimeMinutes,
  }));

  const calorieRange = range(metrics.map((metric) => metric.calories));
  const proteinRange = range(metrics.map((metric) => metric.protein));
  const fibreRange = range(metrics.map((metric) => metric.fibre));
  const vegFruitRange = range(metrics.map((metric) => metric.vegFruit));
  const costRange = range(metrics.map((metric) => metric.cost));
  const timeRange = range(metrics.map((metric) => metric.timeMinutes));

  const scored = metrics.map((metric) => {
    let score = 0;
    if (goals.includes('lower_calorie')) {
      score += normalise(metric.calories, calorieRange.min, calorieRange.max);
    }
    if (goals.includes('high_protein')) {
      score += 1 - normalise(metric.protein, proteinRange.min, proteinRange.max);
    }
    if (goals.includes('high_fibre')) {
      score += 1 - normalise(metric.fibre, fibreRange.min, fibreRange.max);
    }
    if (goals.includes('five_a_day')) {
      score += 1 - normalise(metric.vegFruit, vegFruitRange.min, vegFruitRange.max);
    }
    if (goals.includes('cheapest_possible')) {
      score += 1.5 * normalise(metric.cost, costRange.min, costRange.max);
    }
    if (effort === 'easy') {
      score += 0.75 * normalise(metric.timeMinutes, timeRange.min, timeRange.max);
    }
    return { recipe: metric.recipe, score };
  });

  return scored.sort((left, right) => left.score - right.score).map((entry) => entry.recipe);
}
