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
  type DietType,
  type DietaryPreference,
  type DietaryRestriction,
  type NutritionGoal,
  type UserProfile,
} from '@/domain';
import { copy } from '@/copy';
import { spacing } from '@/theme';

const DIETS = Object.keys(copy.diets) as DietType[];
const GOALS = Object.keys(copy.goals) as NutritionGoal[];
const RESTRICTIONS = Object.keys(copy.restrictions) as DietaryRestriction[];

export default function PreferencesScreen() {
  const { onboardingDraft, completeOnboarding } = useMealMabelApp();
  const [diet, setDiet] = useState<DietType>('anything');
  const [goals, setGoals] = useState<NutritionGoal[]>(['high_protein']);
  const [restrictions, setRestrictions] = useState<DietaryRestriction[]>([]);
  const [dislikes, setDislikes] = useState<string>(copy.preferences.defaultDislikes);
  const [saving, setSaving] = useState(false);

  const toggle = <T extends string>(value: T, values: T[], set: (v: T[]) => void) =>
    set(values.includes(value) ? values.filter((item) => item !== value) : [...values, value]);

  const finish = async () => {
    setSaving(true);
    const now = new Date().toISOString();
    const dietaryPreferences: DietaryPreference[] =
      diet === 'anything' ? ['none'] : [diet];
    const householdTargets = aggregateHouseholdTargets(onboardingDraft.members);
    const profile: UserProfile = {
      id: 'local-user',
      name: copy.profile.defaultName,
      householdId: 'household-local',
      createdAt: now,
      updatedAt: now,
      preferences: {
        dietType: diet,
        nutritionGoals: goals,
        dietaryRestrictions: restrictions,
        cookingEffort: 'easy',
        dietaryPreferences,
        excludedIngredients: dislikes
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
        allergens: restrictions,
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
      <SectionHeader title={copy.preferences.diet} subtitle={copy.preferences.dietSubtitle} />
      <View style={styles.chips}>
        {DIETS.map((value) => (
          <ChoiceChip
            key={value}
            label={copy.diets[value]}
            selected={diet === value}
            onPress={() => setDiet(value)}
          />
        ))}
      </View>
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
});
