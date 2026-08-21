import { describe, expect, it } from '@jest/globals';

import { aggregateIngredientRequirements } from '@/domain/ingredients';
import type { UserPreferences } from '@/domain/models';
import { SEEDED_WEEKLY_PLAN } from '@/fixtures/weekly-plan';
import { createMockPlanModification, MockMealPlanningService } from '@/services';

const preferences: UserPreferences = {
  dietaryPreferences: ['none'],
  dietType: 'anything',
  dietaryRestrictions: [],
  excludedIngredients: [],
  allergens: [],
  dailyCalorieTarget: 2200,
  dailyProteinTargetG: 130,
  maximumWeeklyBudget: 60,
  preferredRetailers: ['tesco', 'asda', 'sainsburys'],
  cookingTimeLimitMinutes: 40,
};

describe('mock plan modifications', () => {
  it('turns a quicker request into a structured swap and refreshes ingredients', async () => {
    const meal = SEEDED_WEEKLY_PLAN.days[0].meals[1];
    const draft = createMockPlanModification(
      SEEDED_WEEKLY_PLAN,
      meal.id,
      'Make it quicker',
      preferences,
    );

    expect(draft.ok).toBe(true);
    if (!draft.ok) return;
    expect(draft.request.modifications[0].type).toBe('swap-meal');

    const updated = await new MockMealPlanningService({ delayMs: 0 }).modifyPlan(
      SEEDED_WEEKLY_PLAN,
      draft.request,
    );
    const updatedMeal = updated.days[0].meals[1];
    expect(updatedMeal.recipe.id).not.toBe(meal.recipe.id);
    expect(updatedMeal.recipe.prepTimeMinutes + updatedMeal.recipe.cookTimeMinutes).toBeLessThan(
      meal.recipe.prepTimeMinutes + meal.recipe.cookTimeMinutes,
    );
    expect(aggregateIngredientRequirements(updated)).not.toEqual(
      aggregateIngredientRequirements(SEEDED_WEEKLY_PLAN),
    );
  });

  it('supports explicit recipe requests and serving changes', () => {
    const lunch = SEEDED_WEEKLY_PLAN.days[0].meals[1];
    const recipeDraft = createMockPlanModification(
      SEEDED_WEEKLY_PLAN,
      lunch.id,
      'Replace this with chicken pasta',
      preferences,
    );
    expect(recipeDraft.ok && recipeDraft.nextRecipeName).toBe('Chicken Pesto Protein Pasta');

    const servingsDraft = createMockPlanModification(
      SEEDED_WEEKLY_PLAN,
      lunch.id,
      'Serve 4 people',
      preferences,
    );
    expect(servingsDraft.ok && servingsDraft.servings).toBe(4);
    if (!servingsDraft.ok) return;
    expect(servingsDraft.request.modifications[0]).toEqual({
      type: 'change-servings',
      date: SEEDED_WEEKLY_PLAN.days[0].date,
      mealId: lunch.id,
      servings: 4,
    });
  });

  it('refuses unsafe or unsupported requests without changing the plan', () => {
    const breakfast = SEEDED_WEEKLY_PLAN.days[0].meals[0];
    const noSafeBreakfast = createMockPlanModification(
      SEEDED_WEEKLY_PLAN,
      breakfast.id,
      'Something different',
      {
        ...preferences,
        dietaryRestrictions: ['dairy_free', 'egg_free', 'nut_free'],
        allergens: ['dairy_free', 'egg_free', 'nut_free'],
      },
    );
    expect(noSafeBreakfast).toEqual({ ok: false, reason: 'no-safe-match' });

    expect(
      createMockPlanModification(
        SEEDED_WEEKLY_PLAN,
        breakfast.id,
        'Surprise me with a feast',
        preferences,
      ),
    ).toEqual({ ok: false, reason: 'unsupported-request' });
  });
});
