import type { Meal, NutritionSummary, PlanDay } from '@/domain/models';

export const EMPTY_NUTRITION: NutritionSummary = {
  caloriesKcal: 0,
  proteinG: 0,
  carbohydratesG: 0,
  fatG: 0,
  fibreG: 0,
};

export function addNutrition(
  left: NutritionSummary,
  right: NutritionSummary,
): NutritionSummary {
  return {
    caloriesKcal: left.caloriesKcal + right.caloriesKcal,
    proteinG: left.proteinG + right.proteinG,
    carbohydratesG: left.carbohydratesG + right.carbohydratesG,
    fatG: left.fatG + right.fatG,
    fibreG: left.fibreG + right.fibreG,
  };
}

export function scaleNutrition(
  nutrition: NutritionSummary,
  multiplier: number,
): NutritionSummary {
  return {
    caloriesKcal: nutrition.caloriesKcal * multiplier,
    proteinG: nutrition.proteinG * multiplier,
    carbohydratesG: nutrition.carbohydratesG * multiplier,
    fatG: nutrition.fatG * multiplier,
    fibreG: nutrition.fibreG * multiplier,
  };
}

export function calculateMealNutrition(meal: Meal): NutritionSummary {
  return scaleNutrition(meal.recipe.nutritionPerServing, meal.servings);
}

export function calculateDayNutrition(meals: Meal[]): NutritionSummary {
  return meals.reduce(
    (total, meal) => addNutrition(total, calculateMealNutrition(meal)),
    EMPTY_NUTRITION,
  );
}

export function calculatePlanNutrition(days: PlanDay[]): NutritionSummary {
  return days.reduce(
    (total, day) => addNutrition(total, calculateDayNutrition(day.meals)),
    EMPTY_NUTRITION,
  );
}
