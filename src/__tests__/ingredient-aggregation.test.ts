import { describe, expect, it } from '@jest/globals';

import { aggregateIngredientRequirements } from '@/domain/ingredients';
import { SEEDED_WEEKLY_PLAN } from '@/fixtures/weekly-plan';

describe('aggregateIngredientRequirements', () => {
  it('aggregates all 21 meals and scales repeated ingredients', () => {
    expect(
      SEEDED_WEEKLY_PLAN.days.flatMap((day) => day.meals),
    ).toHaveLength(21);

    const requirements = aggregateIngredientRequirements(SEEDED_WEEKLY_PLAN);
    const byId = new Map(
      requirements.map((requirement) => [
        requirement.ingredientId,
        requirement,
      ]),
    );

    expect(byId.get('oats')).toMatchObject({ quantity: 500, unit: 'g' });
    expect(byId.get('greek-yoghurt')).toMatchObject({
      quantity: 1380,
      unit: 'g',
    });
    expect(byId.get('chicken-breast')).toMatchObject({
      quantity: 960,
      unit: 'g',
    });
  });

  it('returns one deterministic entry per ingredient and unit', () => {
    const requirements = aggregateIngredientRequirements(SEEDED_WEEKLY_PLAN);
    const keys = requirements.map(
      (requirement) => `${requirement.ingredientId}:${requirement.unit}`,
    );

    expect(new Set(keys).size).toBe(keys.length);
    expect(requirements.map((requirement) => requirement.name)).toEqual(
      [...requirements]
        .map((requirement) => requirement.name)
        .sort((left, right) => left.localeCompare(right)),
    );
  });
});
