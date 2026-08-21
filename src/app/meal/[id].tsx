import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { useMealMabelApp } from '@/app-state/app-provider';
import {
  AppHeader,
  AppText,
  AppTextInput,
  BottomSheet,
  Card,
  ChoiceChip,
  MabelInsight,
  NutritionPill,
  PrimaryButton,
  Screen,
  SecondaryButton,
  SectionHeader,
} from '@/components';
import { copy, formatAllergenList, formatGrams, formatKcal, formatMinutes } from '@/copy';
import { colors, spacing } from '@/theme';

const MEAL_TYPE_TINTS = {
  breakfast: colors.peach,
  lunch: colors.sageSoft,
  dinner: colors.sageSoft,
} as const;

export default function MealDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state, swapMeal } = useMealMabelApp();
  const [sheet, setSheet] = useState<'swap' | null>(null);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const match = state.currentPlan?.days
    .flatMap((day) => day.meals.map((meal) => ({ day, meal })))
    .find(({ meal }) => meal.id === id);
  if (!match || !state.currentPlan) {
    return (
      <Screen>
        <AppHeader title={copy.meal.fallbackTitle} onBack={() => router.back()} />
        <MabelInsight>{copy.meal.missing}</MabelInsight>
      </Screen>
    );
  }
  const { meal, day } = match;
  const recipe = meal.recipe;
  const submitSwap = async (reason: string) => {
    setSaving(true);
    await swapMeal({
      planId: state.currentPlan!.id,
      date: day.date,
      mealId: meal.id,
      reason,
    });
    setSaving(false);
    setSheet(null);
  };
  return (
    <Screen>
      <AppHeader
        title={recipe.name}
        subtitle={copy.meal.subtitle(day.dayName, copy.mealTypes[meal.type])}
        onBack={() => router.back()}
      />
      <Card
        style={[styles.image, { backgroundColor: MEAL_TYPE_TINTS[meal.type] }]}
        accessibilityLabel={copy.a11y.mealImagePlaceholder}
      >
        <View style={styles.imagePlaceholder}>
          <AppText variant="caption" tone="muted">
            {copy.components.mealPhotoPlaceholder}
          </AppText>
        </View>
      </Card>
      <View style={styles.pills}>
        <NutritionPill
          label={copy.meal.energy}
          value={formatKcal(recipe.nutritionPerServing.caloriesKcal)}
        />
        <NutritionPill
          label={copy.meal.protein}
          value={formatGrams(recipe.nutritionPerServing.proteinG)}
        />
        <NutritionPill
          label={copy.meal.time}
          value={formatMinutes(recipe.prepTimeMinutes + recipe.cookTimeMinutes)}
        />
      </View>
      <AppText tone="muted">{recipe.description}</AppText>
      <SectionHeader title={copy.meal.allergens} />
      <Card>
        <AppText>
          {recipe.allergens.length > 0
            ? copy.meal.contains(formatAllergenList(recipe.allergens))
            : copy.meal.noAllergens}
        </AppText>
      </Card>
      <SectionHeader title={copy.meal.ingredients} subtitle={copy.common.servings(meal.servings)} />
      <Card>
        {recipe.ingredients.map((ingredient) => (
          <View key={ingredient.ingredientId} style={styles.row}>
            <AppText>• {ingredient.name}</AppText>
            <AppText tone="muted">
              {copy.common.emDashQuantity(ingredient.quantity, ingredient.unit)}
            </AppText>
          </View>
        ))}
      </Card>
      <SectionHeader title={copy.meal.method} />
      {recipe.instructions.map((instruction, index) => (
        <View key={instruction} style={styles.step}>
          <AppText variant="bodyStrong">{index + 1}</AppText>
          <AppText style={styles.flex}>{instruction}</AppText>
        </View>
      ))}
      <PrimaryButton label={copy.meal.swap} onPress={() => setSheet('swap')} />
      <SecondaryButton
        label={copy.meal.ask}
        onPress={() =>
          router.push({
            pathname: '/ask-mabel',
            params: { mealId: meal.id },
          })
        }
      />

      <BottomSheet
        visible={sheet === 'swap'}
        title={copy.meal.swapTitle}
        onClose={() => setSheet(null)}
      >
        <View style={styles.chips}>
          {copy.meal.options.map((option) => (
            <ChoiceChip
              key={option}
              label={option}
              selected={false}
              onPress={() => void submitSwap(option)}
            />
          ))}
        </View>
        <AppTextInput
          label={copy.meal.swapPrompt}
          placeholder={copy.meal.swapPlaceholder}
          value={message}
          onChangeText={setMessage}
        />
        <PrimaryButton
          label={copy.meal.swapCta}
          loading={saving}
          disabled={!message.trim()}
          onPress={() => void submitSwap(message)}
        />
      </BottomSheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  image: { minHeight: 180, alignItems: 'center', justifyContent: 'center' },
  imagePlaceholder: {
    backgroundColor: 'rgba(255,255,255,0.75)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: spacing.sm,
  },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: spacing.xs,
  },
  step: { flexDirection: 'row', gap: spacing.md },
  flex: { flex: 1 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
