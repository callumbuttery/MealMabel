import { describe, expect, it } from '@jest/globals';

import {
  validatePlanRequest,
  validateRecipeConstraints,
  validateRecipeHardConstraints,
} from '@/domain/constraints';
import { createHousehold } from '@/domain/household';
import type { PlanRequest } from '@/domain/models';
import { getRecipeById } from '@/fixtures/recipes';

const validRequest: PlanRequest = {
  household: createHousehold(2, 0),
  preferences: {
    dietaryPreferences: ['none'],
    excludedIngredients: [],
    allergens: [],
    dailyCalorieTarget: 2200,
    dailyProteinTargetG: 130,
    maximumWeeklyBudget: 60,
    preferredRetailers: ['tesco', 'asda', 'sainsburys'],
    cookingTimeLimitMinutes: 40,
  },
  weekStarting: '2026-08-17',
  mealsPerDay: ['breakfast', 'lunch', 'dinner'],
};

describe('plan constraints', () => {
  it('accepts a valid household request', () => {
    expect(validatePlanRequest(validRequest)).toEqual([]);
  });

  it('reports household, target, budget and duplicate meal errors', () => {
    const violations = validatePlanRequest({
      ...validRequest,
      household: {
        ...validRequest.household,
        memberCount: 3,
      },
      preferences: {
        ...validRequest.preferences,
        dailyProteinTargetG: 0,
        maximumWeeklyBudget: 0,
      },
      mealsPerDay: ['lunch', 'lunch'],
    });

    expect(violations.map((violation) => violation.code)).toEqual([
      'INVALID_HOUSEHOLD',
      'INVALID_TARGET',
      'INVALID_BUDGET',
      'INVALID_MEALS',
    ]);
  });

  it('detects excluded ingredients, allergens and cooking-time limits', () => {
    const violations = validateRecipeConstraints(getRecipeById('turkey-chilli'), {
      ...validRequest,
      preferences: {
        ...validRequest.preferences,
        excludedIngredients: ['kidney-beans'],
        allergens: [],
        cookingTimeLimitMinutes: 20,
      },
    });

    expect(violations.map((violation) => violation.code)).toEqual([
      'EXCLUDED_INGREDIENT',
      'COOKING_TIME',
    ]);

    expect(
      validateRecipeConstraints(getRecipeById('tuna-bean-salad'), {
        ...validRequest,
        preferences: { ...validRequest.preferences, allergens: ['fish'] },
      }).map((violation) => violation.code),
    ).toContain('ALLERGEN');
  });

  it('treats diets, restrictions and dislikes as hard constraints', () => {
    expect(
      validateRecipeHardConstraints(getRecipeById('turkey-chilli'), {
        ...validRequest,
        preferences: {
          ...validRequest.preferences,
          dietType: 'vegetarian',
        },
      }).map((violation) => violation.code),
    ).toContain('DIET');

    expect(
      validateRecipeHardConstraints(getRecipeById('greek-yoghurt-oats'), {
        ...validRequest,
        preferences: {
          ...validRequest.preferences,
          dietaryRestrictions: ['nut_free'],
        },
      }).map((violation) => violation.code),
    ).toContain('ALLERGEN');

    expect(
      validateRecipeHardConstraints(getRecipeById('greek-yoghurt-oats'), {
        ...validRequest,
        household: createHousehold(1, 0, [
          { ...createHousehold(1, 0).members[0], allergens: ['peanuts'] },
        ]),
      }).map((violation) => violation.code),
    ).toContain('ALLERGEN');

    expect(
      validateRecipeHardConstraints(getRecipeById('turkey-chilli'), {
        ...validRequest,
        preferences: {
          ...validRequest.preferences,
          excludedIngredients: ['Kidney beans'],
        },
      }).map((violation) => violation.code),
    ).toContain('EXCLUDED_INGREDIENT');
  });
});
