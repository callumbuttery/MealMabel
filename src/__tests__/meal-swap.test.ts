import { describe, expect, it } from '@jest/globals';

import { calculateDayNutrition } from '@/domain/nutrition';
import { SEEDED_WEEKLY_PLAN } from '@/fixtures/weekly-plan';
import { MockMealPlanningService } from '@/services/mock-services';

describe('MockMealPlanningService meal swaps', () => {
  it('replaces only the requested meal and refreshes nutrition', async () => {
    const service = new MockMealPlanningService({ delayMs: 0 });
    const originalDay = SEEDED_WEEKLY_PLAN.days[0];
    const originalMeal = originalDay.meals[0];

    const updated = await service.swapMeal(SEEDED_WEEKLY_PLAN, {
      planId: SEEDED_WEEKLY_PLAN.id,
      date: originalDay.date,
      mealId: originalMeal.id,
      replacementRecipeId: 'egg-spinach-toast',
    });

    expect(updated).not.toBe(SEEDED_WEEKLY_PLAN);
    expect(updated.days[0].meals[0].recipe.id).toBe('egg-spinach-toast');
    expect(updated.days[0].meals[1]).toBe(originalDay.meals[1]);
    expect(SEEDED_WEEKLY_PLAN.days[0].meals[0].recipe.id).toBe(
      'greek-yoghurt-oats',
    );
    expect(updated.days[0].nutrition).toEqual(
      calculateDayNutrition(updated.days[0].meals),
    );
    expect(updated.nutrition).not.toEqual(SEEDED_WEEKLY_PLAN.nutrition);
  });

  it('rejects a replacement for the wrong meal type', async () => {
    const service = new MockMealPlanningService({ delayMs: 0 });
    const breakfast = SEEDED_WEEKLY_PLAN.days[0].meals[0];

    await expect(
      service.swapMeal(SEEDED_WEEKLY_PLAN, {
        planId: SEEDED_WEEKLY_PLAN.id,
        date: SEEDED_WEEKLY_PLAN.days[0].date,
        mealId: breakfast.id,
        replacementRecipeId: 'turkey-chilli',
      }),
    ).rejects.toThrow('No suitable replacement recipe');
  });
});
