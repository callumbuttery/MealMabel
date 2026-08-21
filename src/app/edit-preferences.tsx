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
import { copy } from '@/copy';
import {
  requiredHouseholdDiet,
  stricterDiet,
  type DietaryRestriction,
  type DietType,
  type NutritionGoal,
  type RetailerId,
} from '@/domain';
import { DietChips } from '@/features/diet/diet-chips';
import { spacing } from '@/theme';

const GOALS = Object.keys(copy.goals) as NutritionGoal[];
const RESTRICTIONS = Object.keys(copy.restrictions) as DietaryRestriction[];
const RETAILERS = Object.keys(copy.retailers) as RetailerId[];

export default function EditPreferencesScreen() {
  const { state, onboardingDraft, updatePreferences } = useMealMabelApp();
  const preferences = state.profile?.preferences;
  const members = state.profile?.household?.members ?? onboardingDraft.members;
  const requiredDiet = requiredHouseholdDiet(members);
  const [diet, setDiet] = useState<DietType>(
    stricterDiet(preferences?.dietType ?? 'anything', requiredDiet),
  );
  const [goals, setGoals] = useState<NutritionGoal[]>(preferences?.nutritionGoals ?? []);
  const [restrictions, setRestrictions] = useState<DietaryRestriction[]>(
    preferences?.dietaryRestrictions ?? [],
  );
  const [dislikes, setDislikes] = useState(preferences?.excludedIngredients.join(', ') ?? '');
  const [retailers, setRetailers] = useState<RetailerId[]>(
    preferences?.preferredRetailers.length ? [...preferences.preferredRetailers] : [...RETAILERS],
  );
  const [saving, setSaving] = useState(false);

  const toggle = <T extends string>(value: T, values: T[], set: (v: T[]) => void) =>
    set(values.includes(value) ? values.filter((item) => item !== value) : [...values, value]);

  const save = async () => {
    setSaving(true);
    await updatePreferences({
      dietType: diet,
      nutritionGoals: goals,
      dietaryRestrictions: restrictions,
      excludedIngredients: dislikes
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
      preferredRetailers: retailers.length ? retailers : [...RETAILERS],
    });
    router.back();
  };

  return (
    <Screen>
      <AppHeader title={copy.editPreferences.title} onBack={() => router.back()} />
      <AppText tone="muted">{copy.editPreferences.intro}</AppText>
      <DietChips
        title={copy.preferences.diet}
        subtitle={copy.createPlan.dietSubtitle(copy.diets[requiredDiet])}
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
      <SectionHeader
        title={copy.editPreferences.shops}
        subtitle={copy.editPreferences.shopsSubtitle}
      />
      <View style={styles.chips}>
        {RETAILERS.map((value) => (
          <ChoiceChip
            key={value}
            label={copy.retailers[value]}
            selected={retailers.includes(value)}
            onPress={() => toggle(value, retailers, setRetailers)}
          />
        ))}
      </View>
      <PrimaryButton label={copy.editPreferences.save} loading={saving} onPress={save} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.xl },
});
