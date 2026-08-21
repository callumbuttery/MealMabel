import { describe, expect, it } from '@jest/globals';

import {
  buildRetailerBasket,
  compareRetailers,
  optimiseBasketItem,
  productSelectionKey,
} from '@/domain/basket-optimizer';
import { aggregateIngredientRequirements } from '@/domain/ingredients';
import type { GroceryProduct } from '@/domain/models';
import { SEEDED_GROCERY_CATALOGUE } from '@/fixtures/catalogue';
import { SEEDED_WEEKLY_PLAN } from '@/fixtures/weekly-plan';

describe('basket optimisation', () => {
  it('uses whole packs and chooses the lowest-cost sufficient option', () => {
    const products: GroceryProduct[] = [
      {
        id: 'small',
        retailerId: 'tesco',
        ingredientId: 'chicken',
        name: 'Small chicken pack',
        packQuantity: 650,
        packUnit: 'g',
        offer: { price: 3.95, currency: 'GBP' },
      },
      {
        id: 'family',
        retailerId: 'tesco',
        ingredientId: 'chicken',
        name: 'Family chicken pack',
        packQuantity: 1000,
        packUnit: 'g',
        offer: { price: 5.65, currency: 'GBP' },
      },
    ];

    const item = optimiseBasketItem(
      { ingredientId: 'chicken', name: 'Chicken', quantity: 960, unit: 'g' },
      products,
    );

    expect(item).toMatchObject({
      packCount: 1,
      suppliedQuantity: 1000,
      lineTotal: 5.65,
    });
    expect(item?.product.id).toBe('family');
  });

  it('creates complete, plausibly priced seeded retailer baskets', () => {
    const comparison = compareRetailers(
      aggregateIngredientRequirements(SEEDED_WEEKLY_PLAN),
      SEEDED_GROCERY_CATALOGUE,
    );

    expect(comparison.baskets).toHaveLength(3);
    for (const basket of comparison.baskets) {
      expect(basket.unavailableIngredientIds).toEqual([]);
      expect(basket.subtotal).toBeGreaterThanOrEqual(50);
      expect(basket.subtotal).toBeLessThanOrEqual(60);
      expect(basket.items.reduce((total, item) => total + item.lineTotal, 0)).toBeCloseTo(
        basket.subtotal,
        2,
      );
    }
    expect(comparison.cheapestRetailerId).toBe('asda');
  });

  it('recomputes pack counts and totals for a selected product', () => {
    const products = SEEDED_GROCERY_CATALOGUE.filter(
      (product) => product.retailerId === 'tesco' && product.ingredientId === 'chicken-breast',
    );
    const smallPack = products.find((product) => product.packQuantity === 650)!;
    const requirement = {
      ingredientId: 'chicken-breast',
      name: 'Chicken breast',
      quantity: 960,
      unit: 'g' as const,
    };

    const optimal = buildRetailerBasket('tesco', [requirement], products);
    const selected = buildRetailerBasket('tesco', [requirement], products, {
      [productSelectionKey('tesco', 'chicken-breast')]: smallPack.id,
    });

    expect(optimal.items[0].packCount).toBe(1);
    expect(selected.items[0].product.id).toBe(smallPack.id);
    expect(selected.items[0].packCount).toBe(2);
    expect(selected.subtotal).toBeGreaterThan(optimal.subtotal);
  });
});
