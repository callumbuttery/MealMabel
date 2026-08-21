import { describe, expect, it } from '@jest/globals';

import { copy, formatAllergenList } from '@/copy';

describe('copy', () => {
  it('exposes the core product voice', () => {
    expect(copy.welcome.headline).toBe('Meet Mabel.');
    expect(copy.createPlan.cta).toBe('Let Mabel plan it');
    expect(copy.generating.steps.length).toBeGreaterThan(0);
  });

  it('lists allergens in UK English', () => {
    expect(formatAllergenList(['milk'])).toBe('Milk');
    expect(formatAllergenList(['milk', 'eggs'])).toBe('Milk and Eggs');
    expect(formatAllergenList(['milk', 'peanuts', 'gluten'])).toBe('Milk, Peanuts and Gluten');
    expect(copy.meal.contains(formatAllergenList(['fish']))).toBe('Contains Fish.');
  });
});
