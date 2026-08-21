import { describe, expect, it } from '@jest/globals';

import { createHousehold, validateRecipeHardConstraints, type PlanRequest } from '@/domain';
import { MockMealPlanningService } from '@/services';

const baseRequest: PlanRequest = {
  household: createHousehold(2, 0),
  preferences: {
    dietaryPreferences: ['none'],
    dietType: 'anything',
    dietaryRestrictions: [],
    excludedIngredients: [],
    allergens: [],
    dailyCalorieTarget: 4400,
    dailyProteinTargetG: 110,
    maximumWeeklyBudget: 60,
    preferredRetailers: ['tesco', 'asda', 'sainsburys'],
    cookingTimeLimitMinutes: 25,
  },
  weekStarting: '2026-08-17',
  durationDays: 3,
  mealsPerDay: ['breakfast', 'lunch', 'dinner'],
};

describe('constraint-safe mock plan generation', () => {
  it('builds a vegan plan without changing the requested meal types', async () => {
    const service = new MockMealPlanningService({ delayMs: 0 });
    const request: PlanRequest = {
      ...baseRequest,
      preferences: {
        ...baseRequest.preferences,
        dietType: 'vegan',
        dietaryPreferences: ['vegan'],
      },
    };

    const plan = await service.generatePlan(request);
    for (const day of plan.days) {
      expect(day.meals.map((meal) => meal.type)).toEqual(['breakfast', 'lunch', 'dinner']);
      for (const meal of day.meals) {
        expect(meal.recipe.tags).toContain('vegan');
        expect(validateRecipeHardConstraints(meal.recipe, request)).toEqual([]);
      }
    }
  });

  it('replaces nut-containing seeded meals for a nut-free household', async () => {
    const service = new MockMealPlanningService({ delayMs: 0 });
    const request: PlanRequest = {
      ...baseRequest,
      mealsPerDay: ['breakfast'],
      preferences: {
        ...baseRequest.preferences,
        dietaryRestrictions: ['nut_free'],
        allergens: ['nut_free'],
      },
    };

    const plan = await service.generatePlan(request);
    expect(
      plan.days.flatMap((day) => day.meals.flatMap((meal) => meal.recipe.allergens)),
    ).not.toEqual(expect.arrayContaining(['nuts', 'peanuts']));
  });

  it('refuses generation when no safe recipe exists for a requested meal', async () => {
    const service = new MockMealPlanningService({ delayMs: 0 });
    const request: PlanRequest = {
      ...baseRequest,
      mealsPerDay: ['breakfast'],
      preferences: {
        ...baseRequest.preferences,
        dietType: 'vegan',
        dietaryPreferences: ['vegan'],
        excludedIngredients: ['oats'],
      },
    };

    await expect(service.generatePlan(request)).rejects.toEqual(
      expect.objectContaining({
        code: 'NO_SAFE_RECIPES',
        mealTypes: ['breakfast'],
      }),
    );
  });
});
