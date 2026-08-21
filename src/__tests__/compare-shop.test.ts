import { describe, expect, it } from '@jest/globals';

import { MockCompareShopService } from '@/services';

describe('MockCompareShopService', () => {
  it('matches a freeform list, quantities and the cheapest full shop', async () => {
    const result = await new MockCompareShopService({
      delayMs: 0,
    }).compareList('500g chicken breast\nBrown rice\n2 broccoli\n12 eggs\nMilk');

    expect(
      result.matchedItems.map((item) => ({
        id: item.ingredientId,
        quantity: item.quantity,
        unit: item.unit,
      })),
    ).toEqual([
      { id: 'chicken-breast', quantity: 500, unit: 'g' },
      { id: 'brown-rice', quantity: 1000, unit: 'g' },
      { id: 'broccoli', quantity: 1000, unit: 'g' },
      { id: 'eggs', quantity: 12, unit: 'each' },
    ]);
    expect(result.unmatchedLines).toEqual(['Milk']);
    expect(result.comparison.cheapestRetailerId).toBe('asda');
    expect(
      result.comparison.baskets.every((basket) => basket.unavailableIngredientIds.length === 0),
    ).toBe(true);
  });

  it('combines repeated items before calculating pack counts', async () => {
    const result = await new MockCompareShopService({
      delayMs: 0,
    }).compareList('Eggs\n6 eggs');

    expect(result.matchedItems).toHaveLength(1);
    expect(result.matchedItems[0]).toMatchObject({
      ingredientId: 'eggs',
      quantity: 18,
      unit: 'each',
      inputLines: ['Eggs', '6 eggs'],
    });
    expect(result.comparison.baskets[0].items[0].packCount).toBe(2);
  });

  it('keeps unrecognised items out of basket totals', async () => {
    const result = await new MockCompareShopService({
      delayMs: 0,
    }).compareList('Mushrooms\nAvocados');

    expect(result.matchedItems).toEqual([]);
    expect(result.unmatchedLines).toEqual(['Mushrooms', 'Avocados']);
    expect(result.comparison.baskets.every((basket) => basket.subtotal === 0)).toBe(true);
  });
});
