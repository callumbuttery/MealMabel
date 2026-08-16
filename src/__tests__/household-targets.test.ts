import { describe, expect, it } from '@jest/globals';

import {
  aggregateHouseholdTargets,
  createHousehold,
  createHouseholdMember,
  resolveMemberTargets,
  syncHouseholdMembers,
  TYPICAL_ADULT_TARGETS,
} from '@/domain/household';
import type { HouseholdMember } from '@/domain/models';

describe('household nutrition targets', () => {
  it('defaults new people to a typical diet', () => {
    const members = syncHouseholdMembers(1, 1);
    expect(members).toHaveLength(2);
    expect(resolveMemberTargets(members[0])).toEqual(TYPICAL_ADULT_TARGETS);
    expect(members[1].kind).toBe('child');
  });

  it('keeps custom targets when household size changes', () => {
    const customAdult: HouseholdMember = {
      id: 'adult-1',
      displayName: 'Sam',
      kind: 'adult',
      nutritionMode: 'custom',
      customTargets: { caloriesKcal: 2500, proteinG: 180, fibreG: 30 },
    };

    const members = syncHouseholdMembers(2, 0, [customAdult]);
    expect(members[0].displayName).toBe('Sam');
    expect(resolveMemberTargets(members[0])).toEqual({
      caloriesKcal: 2500,
      proteinG: 180,
      fibreG: 30,
    });
    expect(members[1].nutritionMode).toBe('typical');
  });

  it('uses body weight to size a typical diet', () => {
    const member: HouseholdMember = {
      ...createHouseholdMember('adult', 1),
      body: { weightKg: 80 },
    };

    expect(resolveMemberTargets(member)).toEqual({
      caloriesKcal: 2400,
      proteinG: 64,
      fibreG: 30,
    });
  });

  it('adds household targets from mixed typical and custom people', () => {
    const household = createHousehold(2, 0, [
      {
        id: 'adult-1',
        displayName: 'Adult 1',
        kind: 'adult',
        nutritionMode: 'custom',
        customTargets: { caloriesKcal: 2500, proteinG: 180, fibreG: 30 },
      },
      createHouseholdMember('adult', 2),
    ]);

    expect(aggregateHouseholdTargets(household.members)).toEqual({
      caloriesKcal: 2500 + TYPICAL_ADULT_TARGETS.caloriesKcal,
      proteinG: 180 + TYPICAL_ADULT_TARGETS.proteinG,
      fibreG: 30 + TYPICAL_ADULT_TARGETS.fibreG,
    });
  });
});
