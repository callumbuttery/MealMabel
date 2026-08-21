import { blockedAllergensForPreferences } from '@/domain/allergens';
import type { PlanModificationRequest, Recipe, UserPreferences, WeeklyPlan } from '@/domain/models';
import { SEEDED_RECIPES } from '@/fixtures/recipes';

export type MockPlanModificationKind = 'remove' | 'servings' | 'swap';
export type MockPlanModificationFailure =
  | 'meal-not-found'
  | 'unsupported-request'
  | 'no-safe-match'
  | 'no-better-match';

export type MockPlanModificationDraft =
  | {
      ok: true;
      kind: MockPlanModificationKind;
      request: PlanModificationRequest;
      previousRecipeName: string;
      nextRecipeName?: string;
      servings?: number;
    }
  | { ok: false; reason: MockPlanModificationFailure };

type SwapGoal = 'quicker' | 'protein' | 'calories' | 'cheaper' | 'different';

const STOP_WORDS = new Set([
  'a',
  'an',
  'and',
  'change',
  'dish',
  'for',
  'it',
  'make',
  'meal',
  'please',
  'replace',
  'something',
  'swap',
  'the',
  'this',
  'to',
  'with',
]);

function normalise(value: string): string {
  return value.trim().toLowerCase();
}

function totalMinutes(recipe: Recipe): number {
  return recipe.prepTimeMinutes + recipe.cookTimeMinutes;
}

function requestedServings(instruction: string): number | null {
  const match =
    instruction.match(/\b(\d+)\s*(?:servings?|people|portions?)\b/) ??
    instruction.match(/\bfor\s+(\d+)\b/);
  if (!match) return null;
  const servings = Number(match[1]);
  return Number.isInteger(servings) && servings > 0 && servings <= 20 ? servings : null;
}

function swapGoal(instruction: string): SwapGoal | null {
  if (/\b(quick|quicker|fast|faster|less time)\b/.test(instruction)) return 'quicker';
  if (/\b(more protein|higher protein|protein)\b/.test(instruction)) return 'protein';
  if (/\b(fewer calories|less calories|lower calorie|lighter)\b/.test(instruction)) {
    return 'calories';
  }
  if (/\b(cheap|cheaper|save money|less expensive)\b/.test(instruction)) return 'cheaper';
  if (/\b(different|another|swap|replace|change)\b/.test(instruction)) return 'different';
  return null;
}

function recipeMatchesDiet(recipe: Recipe, preferences: UserPreferences): boolean {
  const diet = preferences.dietType;
  if (!diet || diet === 'anything') return true;
  if (diet === 'vegan') return recipe.tags.includes('vegan');
  if (diet === 'vegetarian') {
    return recipe.tags.some((tag) => tag === 'vegetarian' || tag === 'vegan');
  }
  return recipe.tags.some((tag) => ['pescatarian', 'vegetarian', 'vegan'].includes(tag));
}

function recipeIsSafe(recipe: Recipe, preferences: UserPreferences): boolean {
  if (!recipeMatchesDiet(recipe, preferences)) return false;

  const blockedAllergens = new Set(blockedAllergensForPreferences(preferences));
  if (recipe.allergens.some((allergen) => blockedAllergens.has(allergen))) {
    return false;
  }

  const exclusions = preferences.excludedIngredients.map(normalise).filter(Boolean);
  if (
    exclusions.some((excluded) =>
      recipe.ingredients.some((ingredient) => {
        const id = normalise(ingredient.ingredientId).replaceAll('-', ' ');
        const name = normalise(ingredient.name);
        return id.includes(excluded) || name.includes(excluded);
      }),
    )
  ) {
    return false;
  }

  return (
    preferences.cookingTimeLimitMinutes <= 0 ||
    totalMinutes(recipe) <= preferences.cookingTimeLimitMinutes
  );
}

function explicitMatchScore(recipe: Recipe, instruction: string): number {
  const words = normalise(instruction)
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word));
  if (words.length === 0) return 0;
  const searchable = normalise(
    [
      recipe.name,
      recipe.description,
      ...recipe.tags,
      ...recipe.ingredients.map((ingredient) => ingredient.name),
    ].join(' '),
  );
  return words.reduce((score, word) => score + (searchable.includes(word) ? 1 : 0), 0);
}

function rankCandidates(
  candidates: Recipe[],
  current: Recipe,
  goal: SwapGoal,
  instruction: string,
  plan: WeeklyPlan,
): Recipe[] {
  const explicitScores = new Map(
    candidates.map((recipe) => [recipe.id, explicitMatchScore(recipe, instruction)]),
  );
  const hasExplicitMatch = [...explicitScores.values()].some((score) => score > 0);
  const plannedIngredients = new Set(
    plan.days.flatMap((day) =>
      day.meals.flatMap((meal) =>
        meal.recipe.id === current.id
          ? []
          : meal.recipe.ingredients.map((ingredient) => ingredient.ingredientId),
      ),
    ),
  );

  return [...candidates].sort((left, right) => {
    if (hasExplicitMatch) {
      const scoreDifference =
        (explicitScores.get(right.id) ?? 0) - (explicitScores.get(left.id) ?? 0);
      if (scoreDifference !== 0) return scoreDifference;
    }
    if (goal === 'quicker') return totalMinutes(left) - totalMinutes(right);
    if (goal === 'protein') {
      return right.nutritionPerServing.proteinG - left.nutritionPerServing.proteinG;
    }
    if (goal === 'calories') {
      return left.nutritionPerServing.caloriesKcal - right.nutritionPerServing.caloriesKcal;
    }
    if (goal === 'cheaper') {
      const shared = (recipe: Recipe) =>
        recipe.ingredients.filter((ingredient) => plannedIngredients.has(ingredient.ingredientId))
          .length;
      return shared(right) - shared(left);
    }
    return left.id.localeCompare(right.id);
  });
}

export function createMockPlanModification(
  plan: WeeklyPlan,
  mealId: string,
  rawInstruction: string,
  preferences: UserPreferences,
): MockPlanModificationDraft {
  const target = plan.days
    .flatMap((day) => day.meals.map((meal) => ({ date: day.date, meal })))
    .find(({ meal }) => meal.id === mealId);
  if (!target) return { ok: false, reason: 'meal-not-found' };

  const instruction = normalise(rawInstruction);
  if (!instruction) return { ok: false, reason: 'unsupported-request' };

  if (/\b(remove|skip|delete|no longer need)\b/.test(instruction)) {
    return {
      ok: true,
      kind: 'remove',
      previousRecipeName: target.meal.recipe.name,
      request: {
        planId: plan.id,
        modifications: [{ type: 'remove-meal', date: target.date, mealId: target.meal.id }],
      },
    };
  }

  const servings = requestedServings(instruction);
  if (servings !== null) {
    return {
      ok: true,
      kind: 'servings',
      previousRecipeName: target.meal.recipe.name,
      servings,
      request: {
        planId: plan.id,
        modifications: [
          {
            type: 'change-servings',
            date: target.date,
            mealId: target.meal.id,
            servings,
          },
        ],
      },
    };
  }

  const goal = swapGoal(instruction);
  if (!goal) return { ok: false, reason: 'unsupported-request' };

  const safeCandidates = SEEDED_RECIPES.filter(
    (recipe) =>
      recipe.id !== target.meal.recipe.id &&
      recipe.mealTypes.includes(target.meal.type) &&
      recipeIsSafe(recipe, preferences),
  );
  if (safeCandidates.length === 0) return { ok: false, reason: 'no-safe-match' };

  const candidates = safeCandidates.filter((recipe) => {
    if (goal === 'quicker') return totalMinutes(recipe) < totalMinutes(target.meal.recipe);
    if (goal === 'protein') {
      return recipe.nutritionPerServing.proteinG > target.meal.recipe.nutritionPerServing.proteinG;
    }
    if (goal === 'calories') {
      return (
        recipe.nutritionPerServing.caloriesKcal <
        target.meal.recipe.nutritionPerServing.caloriesKcal
      );
    }
    return true;
  });
  if (candidates.length === 0) return { ok: false, reason: 'no-better-match' };

  const replacement = rankCandidates(candidates, target.meal.recipe, goal, instruction, plan)[0];
  return {
    ok: true,
    kind: 'swap',
    previousRecipeName: target.meal.recipe.name,
    nextRecipeName: replacement.name,
    request: {
      planId: plan.id,
      modifications: [
        {
          type: 'swap-meal',
          request: {
            planId: plan.id,
            date: target.date,
            mealId: target.meal.id,
            replacementRecipeId: replacement.id,
            reason: rawInstruction.trim(),
          },
        },
      ],
    },
  };
}
