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
  MabelAvatar,
  MabelInsight,
  NutritionPill,
  PrimaryButton,
  Screen,
  SecondaryButton,
  SectionHeader,
} from '@/components';
import { copy, formatGrams, formatKcal, formatMinutes } from '@/copy';
import { spacing } from '@/theme';

export default function MealDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state, swapMeal } = useMealMabelApp();
  const [sheet, setSheet] = useState<'swap' | 'ask' | null>(null);
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
      <Card style={styles.image}>
        <MabelAvatar size={110} accessibilityLabel={copy.a11y.mealImagePlaceholder} />
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
      <SectionHeader
        title={copy.meal.ingredients}
        subtitle={copy.common.servings(meal.servings)}
      />
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
      <SecondaryButton label={copy.meal.ask} onPress={() => setSheet('ask')} />

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
      <BottomSheet
        visible={sheet === 'ask'}
        title={copy.meal.askTitle}
        onClose={() => setSheet(null)}
      >
        <MabelInsight title={copy.meal.askInsightTitle}>{copy.meal.askInsightBody}</MabelInsight>
        <AppTextInput
          label={copy.meal.askLabel}
          placeholder={copy.meal.askPlaceholder}
          value={message}
          onChangeText={setMessage}
          multiline
        />
        <PrimaryButton
          label={copy.meal.askCta}
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
