import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { useMealMabelApp } from '@/app-state/app-provider';
import {
  AppHeader,
  AppText,
  AppTextInput,
  ChoiceChip,
  PrimaryButton,
  Screen,
  SectionHeader,
} from '@/components';
import {
  aggregateHouseholdTargets,
  expandAllergenCodes,
  householdAllergens,
  requiredHouseholdDiet,
  type DietaryPreference,
  type DietaryRestriction,
  type DietType,
  type NutritionGoal,
  type UserProfile,
} from '@/domain';
import { DietChips } from '@/features/diet/diet-chips';
import { copy, formatAllergenList } from '@/copy';
import { spacing } from '@/theme';

const GOALS = Object.keys(copy.goals) as NutritionGoal[];
const RESTRICTIONS = Object.keys(copy.restrictions) as DietaryRestriction[];

export default function PreferencesScreen() {
  const { onboardingDraft, completeOnboarding } = useMealMabelApp();
  const requiredDiet = requiredHouseholdDiet(onboardingDraft.members);
  const [diet, setDiet] = useState<DietType>(requiredDiet);
  const [goals, setGoals] = useState<NutritionGoal[]>(['high_protein']);
  const [restrictions, setRestrictions] = useState<DietaryRestriction[]>([]);
  const [dislikes, setDislikes] = useState<string>(copy.preferences.defaultDislikes);
  const [saving, setSaving] = useState(false);

  const toggle = <T extends string>(value: T, values: T[], set: (v: T[]) => void) =>
    set(values.includes(value) ? values.filter((item) => item !== value) : [...values, value]);

  const finish = async () => {
    setSaving(true);
    const now = new Date().toISOString();
    const householdDiet = requiredHouseholdDiet(onboardingDraft.members);
    const dietType = diet === 'anything' ? householdDiet : diet;
    const dietaryPreferences: DietaryPreference[] = dietType === 'anything' ? ['none'] : [dietType];
    const householdTargets = aggregateHouseholdTargets(onboardingDraft.members);
    const profile: UserProfile = {
      id: 'local-user',
      name: copy.profile.defaultName,
      householdId: 'household-local',
      createdAt: now,
      updatedAt: now,
      preferences: {
        dietType,
        nutritionGoals: goals,
        dietaryRestrictions: restrictions,
        cookingEffort: 'easy',
        dietaryPreferences,
        excludedIngredients: dislikes
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
        allergens: expandAllergenCodes([
          ...householdAllergens(onboardingDraft.members),
          ...restrictions,
        ]),
        dailyCalorieTarget: householdTargets.caloriesKcal,
        dailyProteinTargetG: householdTargets.proteinG,
        dailyFibreTargetG: householdTargets.fibreG,
        maximumWeeklyBudget: 60,
        preferredRetailers: ['tesco', 'asda', 'sainsburys'],
        cookingTimeLimitMinutes: 25,
      },
    };
    await completeOnboarding(profile);
    router.replace('/(tabs)');
  };

  return (
    <Screen>
      <AppHeader title={copy.preferences.title} onBack={() => router.back()} />
      <DietChips
        title={copy.preferences.diet}
        subtitle={copy.preferences.dietSubtitle}
        value={diet}
        requiredDiet={requiredDiet}
        onChange={setDiet}
      />
      <SectionHeader title={copy.preferences.goals} subtitle={copy.preferences.goalsSubtitle} />
      <View style={styles.chips}>
        {GOALS.map((value) => (
          <ChoiceChip
            key={value}
            label={copy.goals[value]}
            selected={goals.includes(value)}
            onPress={() => toggle(value, goals, setGoals)}
          />
        ))}
      </View>
      <SectionHeader
        title={copy.preferences.allergens}
        subtitle={copy.preferences.allergensSubtitle}
      />
      <AppText tone="muted" style={styles.noted}>
        {householdAllergens(onboardingDraft.members).length > 0
          ? formatAllergenList(householdAllergens(onboardingDraft.members))
          : copy.household.noAllergens}
      </AppText>
      <SectionHeader title={copy.preferences.restrictions} />
      <View style={styles.chips}>
        {RESTRICTIONS.map((value) => (
          <ChoiceChip
            key={value}
            label={copy.restrictions[value]}
            selected={restrictions.includes(value)}
            onPress={() => toggle(value, restrictions, setRestrictions)}
          />
        ))}
      </View>
      <AppText variant="h3">{copy.preferences.dislikesQuestion}</AppText>
      <AppTextInput
        label={copy.preferences.dislikesLabel}
        placeholder={copy.preferences.dislikesPlaceholder}
        value={dislikes}
        onChangeText={setDislikes}
      />
      <PrimaryButton label={copy.preferences.finish} loading={saving} onPress={finish} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.xl },
  noted: { marginBottom: spacing.xl },
});
