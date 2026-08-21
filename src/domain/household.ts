import { copy } from '@/copy';
import type {
  DailyNutritionTargets,
  DietType,
  Household,
  HouseholdMember,
  HouseholdMemberKind,
} from '@/domain/models';

export const TYPICAL_ADULT_TARGETS: DailyNutritionTargets = {
  caloriesKcal: 2200,
  proteinG: 55,
  fibreG: 30,
};

export const TYPICAL_CHILD_TARGETS: DailyNutritionTargets = {
  caloriesKcal: 1800,
  proteinG: 42,
  fibreG: 20,
};

const DIET_STRICTNESS: Record<DietType, number> = {
  anything: 0,
  pescatarian: 1,
  vegetarian: 2,
  vegan: 3,
};

export function createHouseholdMember(kind: HouseholdMemberKind, index: number): HouseholdMember {
  return {
    id: `${kind}-${index}`,
    displayName: copy.household.defaultName(kind, index),
    kind,
    dietType: 'anything',
    allergens: [],
    nutritionMode: 'typical',
  };
}

export function stricterDiet(left: DietType, right: DietType): DietType {
  return DIET_STRICTNESS[left] >= DIET_STRICTNESS[right] ? left : right;
}

export function requiredHouseholdDiet(members: readonly HouseholdMember[]): DietType {
  return members.reduce(
    (required, member) => stricterDiet(required, member.dietType ?? 'anything'),
    'anything' as DietType,
  );
}

export function dietMeetsHouseholdDiet(diet: DietType, requiredDiet: DietType): boolean {
  return DIET_STRICTNESS[diet] >= DIET_STRICTNESS[requiredDiet];
}

export function syncHouseholdMembers(
  adults: number,
  children: number,
  existing: readonly HouseholdMember[] = [],
): HouseholdMember[] {
  return [
    ...resizeMembers(
      existing.filter((member) => member.kind === 'adult'),
      Math.max(0, adults),
      'adult',
    ),
    ...resizeMembers(
      existing.filter((member) => member.kind === 'child'),
      Math.max(0, children),
      'child',
    ),
  ];
}

export function createHousehold(
  adults: number,
  children: number,
  existing: readonly HouseholdMember[] = [],
): Household {
  const members = syncHouseholdMembers(adults, children, existing);
  return {
    id: 'household-local',
    name: 'My household',
    adultCount: adults,
    childCount: children,
    memberCount: adults + children,
    members,
  };
}

export function typicalTargetsFor(member: HouseholdMember): DailyNutritionTargets {
  const base = member.kind === 'child' ? TYPICAL_CHILD_TARGETS : TYPICAL_ADULT_TARGETS;
  const weightKg = member.body?.weightKg;
  if (!weightKg || weightKg <= 0) {
    return base;
  }

  const caloriesPerKg = member.kind === 'child' ? 35 : 30;
  const proteinPerKg = member.kind === 'child' ? 1 : 0.8;
  return {
    caloriesKcal: Math.round(weightKg * caloriesPerKg),
    proteinG: Math.round(weightKg * proteinPerKg),
    fibreG: base.fibreG,
  };
}

export function resolveMemberTargets(member: HouseholdMember): DailyNutritionTargets {
  const typical = typicalTargetsFor(member);
  if (member.nutritionMode !== 'custom') {
    return typical;
  }

  return {
    caloriesKcal: positiveOr(member.customTargets?.caloriesKcal, typical.caloriesKcal),
    proteinG: positiveOr(member.customTargets?.proteinG, typical.proteinG),
    fibreG: positiveOr(member.customTargets?.fibreG, typical.fibreG),
  };
}

export function aggregateHouseholdTargets(
  members: readonly HouseholdMember[],
): DailyNutritionTargets {
  return members.reduce<DailyNutritionTargets>(
    (total, member) => {
      const targets = resolveMemberTargets(member);
      return {
        caloriesKcal: total.caloriesKcal + targets.caloriesKcal,
        proteinG: total.proteinG + targets.proteinG,
        fibreG: total.fibreG + targets.fibreG,
      };
    },
    { caloriesKcal: 0, proteinG: 0, fibreG: 0 },
  );
}

export function formatNutritionTargets(targets: DailyNutritionTargets): string {
  return copy.household.nutritionLine(
    formatNumber(targets.caloriesKcal),
    formatNumber(targets.proteinG),
    formatNumber(targets.fibreG),
  );
}

function resizeMembers(
  existing: readonly HouseholdMember[],
  count: number,
  kind: HouseholdMemberKind,
): HouseholdMember[] {
  const kept = existing.slice(0, count).map((member, index) => ({
    ...member,
    id: `${kind}-${index + 1}`,
    displayName: member.displayName.trim() || createHouseholdMember(kind, index + 1).displayName,
  }));

  while (kept.length < count) {
    kept.push(createHouseholdMember(kind, kept.length + 1));
  }

  return kept;
}

function positiveOr(value: number | undefined, fallback: number): number {
  return value !== undefined && value > 0 ? value : fallback;
}

function formatNumber(value: number): string {
  return value.toLocaleString('en-GB');
}
