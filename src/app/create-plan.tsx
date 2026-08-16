import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import {
  AppHeader,
  AppText,
  Card,
  ChoiceChip,
  CurrencyInput,
  PrimaryButton,
  Screen,
  SectionHeader,
} from '@/components';
import { copy } from '@/copy';
import type { CookingEffort, MealType, RetailerId } from '@/domain';
import { spacing } from '@/theme';

const MEALS = Object.keys(copy.mealTypes) as MealType[];
const RETAILERS = Object.keys(copy.retailers) as RetailerId[];
const EFFORTS = Object.keys(copy.createPlan.effort) as CookingEffort[];

export default function CreatePlanScreen() {
  const [budget, setBudget] = useState('60');
  const [days, setDays] = useState(7);
  const [meals, setMeals] = useState<MealType[]>([...MEALS]);
  const [effort, setEffort] = useState<CookingEffort>('easy');
  const [retailers, setRetailers] = useState<RetailerId[]>([...RETAILERS]);
  const toggle = <T extends string>(value: T, values: T[], set: (v: T[]) => void) =>
    set(values.includes(value) ? values.filter((item) => item !== value) : [...values, value]);
  const valid = Number(budget) >= 20 && Number(budget) <= 300 && meals.length > 0 && retailers.length > 0;

  return (
    <Screen>
      <AppHeader title={copy.createPlan.title} onBack={() => router.back()} />
      <AppText variant="h2">{copy.createPlan.budgetHeadline}</AppText>
      <CurrencyInput
        label={copy.createPlan.budgetLabel}
        value={budget}
        onChangeValue={setBudget}
        helperText={copy.createPlan.budgetHelper}
        error={budget && !valid ? copy.createPlan.validation : undefined}
      />
      <SectionHeader title={copy.createPlan.meals} />
      <View style={styles.chips}>
        {MEALS.map((value) => (
          <ChoiceChip
            key={value}
            label={copy.mealTypes[value]}
            selected={meals.includes(value)}
            onPress={() => toggle(value, meals, setMeals)}
          />
        ))}
      </View>
      <SectionHeader title={copy.createPlan.days} />
      <View style={styles.chips}>
        {([3, 5, 7] as const).map((value) => (
          <ChoiceChip
            key={value}
            label={copy.createPlan.daysOption(value)}
            selected={days === value}
            onPress={() => setDays(value)}
          />
        ))}
      </View>
      <SectionHeader title={copy.createPlan.priorities} />
      <View style={styles.chips}>
        <ChoiceChip label={copy.goals.high_protein} selected onPress={() => undefined} />
        <ChoiceChip
          label={copy.createPlan.lowEffort}
          selected={effort === 'easy'}
          onPress={() => setEffort('easy')}
        />
        <ChoiceChip label={copy.diets.anything} selected onPress={() => undefined} />
      </View>
      <SectionHeader title={copy.createPlan.cooking} />
      <View style={styles.cards}>
        {EFFORTS.map((value) => (
          <Card key={value} style={styles.option}>
            <ChoiceChip
              label={copy.createPlan.effort[value].label}
              selected={effort === value}
              onPress={() => setEffort(value)}
            />
            <AppText variant="caption" tone="muted">
              {copy.createPlan.effort[value].body}
            </AppText>
          </Card>
        ))}
      </View>
      <SectionHeader title={copy.createPlan.shops} />
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
      <PrimaryButton
        label={copy.createPlan.cta}
        disabled={!valid}
        onPress={() =>
          router.push({
            pathname: '/generating',
            params: {
              budget,
              days: String(days),
              meals: meals.join(','),
              retailers: retailers.join(','),
            },
          })
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  cards: { gap: spacing.sm },
  option: { gap: spacing.sm },
});
