import { describe, expect, it } from '@jest/globals';

import { createHousehold } from '@/domain/household';
import type { PlanRequest, Recipe } from '@/domain/models';
import { rankRecipesForRequest } from '@/domain/plan-optimizer';
import { SEEDED_GROCERY_CATALOGUE } from '@/fixtures/catalogue';
import { SEEDED_RECIPES } from '@/fixtures/recipes';

const breakfasts: Recipe[] = SEEDED_RECIPES.filter((recipe) =>
  recipe.mealTypes.includes('breakfast'),
);

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
    cookingTimeLimitMinutes: 60,
  },
  weekStarting: '2026-08-17',
  durationDays: 3,
  mealsPerDay: ['breakfast'],
};

describe('soft-goal recipe ranking', () => {
  it('leaves the seeded order untouched with no goals and default effort', () => {
    const ranked = rankRecipesForRequest(breakfasts, baseRequest, SEEDED_GROCERY_CATALOGUE);
    expect(ranked.map((recipe) => recipe.id)).toEqual(breakfasts.map((recipe) => recipe.id));
  });

  it('puts the highest-protein safe recipe first for a high-protein goal', () => {
    const request: PlanRequest = {
      ...baseRequest,
      preferences: { ...baseRequest.preferences, nutritionGoals: ['high_protein'] },
    };
    const ranked = rankRecipesForRequest(breakfasts, request, SEEDED_GROCERY_CATALOGUE);
    expect(ranked[0].id).toBe('egg-spinach-toast');
  });

  it('puts the cheapest safe recipe first for a cheapest-possible goal', () => {
    const request: PlanRequest = {
      ...baseRequest,
      preferences: { ...baseRequest.preferences, nutritionGoals: ['cheapest_possible'] },
    };
    const ranked = rankRecipesForRequest(breakfasts, request, SEEDED_GROCERY_CATALOGUE);
    expect(ranked[0].id).toBe('banana-berry-oats');
  });

  it('puts one of the quickest safe recipes first for easy cooking effort', () => {
    const request: PlanRequest = {
      ...baseRequest,
      preferences: { ...baseRequest.preferences, cookingEffort: 'easy' },
    };
    const ranked = rankRecipesForRequest(breakfasts, request, SEEDED_GROCERY_CATALOGUE);
    expect(['greek-yoghurt-oats', 'banana-berry-oats']).toContain(ranked[0].id);
  });
});
