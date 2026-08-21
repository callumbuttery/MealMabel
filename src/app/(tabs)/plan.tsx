import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { useMealMabelApp } from '@/app-state/app-provider';
import { AppText, ChoiceChip, EmptyState, MealCard, Screen, SectionHeader } from '@/components';
import { copy, formatAllergenNote, formatMinutes } from '@/copy';
import { spacing } from '@/theme';

export default function PlanScreen() {
  const { state } = useMealMabelApp();
  const plan = state.currentPlan;
  const [dayIndex, setDayIndex] = useState(0);
  if (!plan) {
    return (
      <Screen>
        <AppText variant="h1">{copy.plan.title}</AppText>
        <EmptyState
          title={copy.plan.emptyTitle}
          message={copy.plan.emptyBody}
          actionLabel={copy.plan.emptyCta}
          onAction={() => router.push('/create-plan')}
        />
      </Screen>
    );
  }
  const day = plan.days[dayIndex] ?? plan.days[0];
  const mealCount = plan.days.reduce((count, item) => count + item.meals.length, 0);
  const protein = Math.round(plan.nutrition.proteinG / plan.days.length);
  return (
    <Screen>
      <AppText variant="h1">{copy.plan.title}</AppText>
      <AppText tone="muted">{copy.plan.weekSummary(mealCount, protein)}</AppText>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.days}
      >
        {plan.days.map((item, index) => (
          <ChoiceChip
            key={item.date}
            label={item.dayName.slice(0, 3)}
            selected={index === dayIndex}
            onPress={() => setDayIndex(index)}
          />
        ))}
      </ScrollView>
      <SectionHeader
        title={day.dayName}
        subtitle={copy.plan.daySummary(day.nutrition.caloriesKcal, day.nutrition.proteinG)}
      />
      <View style={styles.meals}>
        {day.meals.map((meal) => (
          <MealCard
            key={meal.id}
            badge={copy.mealTypes[meal.type]}
            title={meal.recipe.name}
            time={formatMinutes(meal.recipe.prepTimeMinutes + meal.recipe.cookTimeMinutes)}
            cost={copy.plan.mealCardCost(
              meal.recipe.nutritionPerServing.caloriesKcal,
              meal.recipe.nutritionPerServing.proteinG,
            )}
            note={formatAllergenNote(meal.recipe.allergens)}
            onPress={() => router.push({ pathname: '/meal/[id]', params: { id: meal.id } })}
          />
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  days: { gap: spacing.sm, paddingVertical: spacing.md },
  meals: { gap: spacing.lg },
});
