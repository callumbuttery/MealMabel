import { describe, expect, it } from '@jest/globals';

import { copy } from '@/copy';

describe('copy', () => {
  it('exposes the core product voice', () => {
    expect(copy.welcome.headline).toBe('Meet Mabel.');
    expect(copy.createPlan.cta).toBe('Let Mabel plan it');
    expect(copy.generating.steps.length).toBeGreaterThan(0);
  });
});
