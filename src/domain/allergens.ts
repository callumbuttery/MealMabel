import type {
  AllergenId,
  DietaryRestriction,
  HouseholdMember,
  PlanRequest,
  Recipe,
  UserPreferences,
} from '@/domain/models';

export const ALLERGEN_IDS = [
  'celery',
  'gluten',
  'crustaceans',
  'eggs',
  'fish',
  'lupin',
  'milk',
  'molluscs',
  'mustard',
  'nuts',
  'peanuts',
  'sesame',
  'soya',
  'sulphites',
] as const satisfies readonly AllergenId[];

export const RESTRICTION_ALLERGENS: Record<DietaryRestriction, AllergenId[]> = {
  nut_free: ['nuts', 'peanuts'],
  dairy_free: ['milk'],
  gluten_free: ['gluten'],
  egg_free: ['eggs'],
};

const ALLERGEN_SET = new Set<string>(ALLERGEN_IDS);

function normalise(value: string): string {
  return value.toLowerCase().replaceAll('-', '_').trim();
}

export function isAllergenId(value: string): value is AllergenId {
  return ALLERGEN_SET.has(value);
}

export function expandAllergenCodes(codes: readonly string[]): AllergenId[] {
  const expanded = new Set<AllergenId>();
  for (const code of codes) {
    const key = normalise(code);
    if (!key) continue;
    if (key in RESTRICTION_ALLERGENS) {
      for (const allergen of RESTRICTION_ALLERGENS[key as DietaryRestriction]) {
        expanded.add(allergen);
      }
    }
    if (isAllergenId(key)) {
      expanded.add(key);
    }
  }
  return ALLERGEN_IDS.filter((allergen) => expanded.has(allergen));
}

export function householdAllergens(members: readonly HouseholdMember[]): AllergenId[] {
  return expandAllergenCodes(members.flatMap((member) => member.allergens ?? []));
}

export function blockedAllergensForPreferences(preferences: UserPreferences): AllergenId[] {
  return expandAllergenCodes([
    ...preferences.allergens,
    ...(preferences.dietaryRestrictions ?? []),
    ...preferences.dietaryPreferences.filter((preference) => preference.endsWith('-free')),
  ]);
}

export function blockedAllergensForRequest(request: PlanRequest): AllergenId[] {
  return expandAllergenCodes([
    ...householdAllergens(request.household.members),
    ...blockedAllergensForPreferences(request.preferences),
  ]);
}

export function recipeContainsBlockedAllergen(
  recipe: Pick<Recipe, 'allergens'>,
  blocked: readonly AllergenId[],
): boolean {
  const blockedSet = new Set(blocked);
  return recipe.allergens.some((allergen) => blockedSet.has(normalise(allergen) as AllergenId));
}

export function toggleAllergen(
  allergens: readonly AllergenId[],
  allergen: AllergenId,
): AllergenId[] {
  const selected = new Set(allergens);
  if (selected.has(allergen)) {
    selected.delete(allergen);
  } else {
    selected.add(allergen);
  }
  return ALLERGEN_IDS.filter((item) => selected.has(item));
}

export function mergePreferenceAllergens(
  preferences: UserPreferences,
  members: readonly HouseholdMember[],
): AllergenId[] {
  return expandAllergenCodes([
    ...householdAllergens(members),
    ...blockedAllergensForPreferences(preferences),
  ]);
}
