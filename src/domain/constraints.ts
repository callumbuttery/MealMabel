import type { PlanRequest, Recipe, WeeklyPlan } from '@/domain/models';

export interface ConstraintViolation {
  code:
    | 'INVALID_HOUSEHOLD'
    | 'INVALID_TARGET'
    | 'INVALID_BUDGET'
    | 'INVALID_MEALS'
    | 'EXCLUDED_INGREDIENT'
    | 'ALLERGEN'
    | 'COOKING_TIME';
  message: string;
}

export function validatePlanRequest(request: PlanRequest): ConstraintViolation[] {
  const violations: ConstraintViolation[] = [];

  const memberCountMismatch =
    request.household.memberCount < 1 ||
    request.household.adultCount + request.household.childCount !==
      request.household.memberCount;
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
  if (
    request.preferences.dailyCalorieTarget <= 0 ||
    request.preferences.dailyProteinTargetG <= 0
  ) {
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
  if (request.mealsPerDay.length === 0 || new Set(request.mealsPerDay).size !== request.mealsPerDay.length) {
    violations.push({
      code: 'INVALID_MEALS',
      message: 'At least one unique meal type must be requested.',
    });
  }

  return violations;
}

export function validateRecipeConstraints(
  recipe: Recipe,
  request: PlanRequest,
): ConstraintViolation[] {
  const violations: ConstraintViolation[] = [];
  const exclusions = new Set(
    request.preferences.excludedIngredients.map((item) => item.toLowerCase()),
  );
  const allergens = new Set(
    request.preferences.allergens.map((item) => item.toLowerCase()),
  );

  if (
    recipe.ingredients.some(
      (ingredient) =>
        exclusions.has(ingredient.ingredientId.toLowerCase()) ||
        exclusions.has(ingredient.name.toLowerCase()),
    )
  ) {
    violations.push({
      code: 'EXCLUDED_INGREDIENT',
      message: `${recipe.name} contains an excluded ingredient.`,
    });
  }
  if (recipe.allergens.some((allergen) => allergens.has(allergen.toLowerCase()))) {
    violations.push({
      code: 'ALLERGEN',
      message: `${recipe.name} contains a household allergen.`,
    });
  }
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
