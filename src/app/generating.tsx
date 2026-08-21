import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet } from 'react-native';

import { useMealMabelApp } from '@/app-state/app-provider';
import { AppText, Blob, LoadingMabel, MabelInsight, PrimaryButton, Screen } from '@/components';
import {
  aggregateHouseholdTargets,
  createHousehold,
  type CookingEffort,
  type MealType,
  type PlanRequest,
  type RetailerId,
} from '@/domain';
import { copy } from '@/copy';
import { colors, spacing } from '@/theme';

export default function GeneratingScreen() {
  const params = useLocalSearchParams<{
    budget?: string;
    days?: string;
    meals?: string;
    retailers?: string;
    effort?: string;
  }>();
  const { state, onboardingDraft, generatePlan } = useMealMabelApp();
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const started = useRef(false);
  const budgetParam = params.budget;
  const daysParam = params.days;
  const mealsParam = params.meals;
  const retailersParam = params.retailers;
  const effortParam = params.effort;

  const run = useCallback(async () => {
    setError(null);
    const preferences = state.profile?.preferences;
    if (!preferences) {
      setError(copy.generating.missingPreferences);
      return;
    }
    const now = new Date();
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    const household = createHousehold(
      onboardingDraft.adults,
      onboardingDraft.children,
      onboardingDraft.members,
    );
    const householdTargets = aggregateHouseholdTargets(household.members);
    const requestedBudget = Number(budgetParam);
    const maximumWeeklyBudget =
      Number.isFinite(requestedBudget) && requestedBudget >= 20 && requestedBudget <= 300
        ? requestedBudget
        : preferences.maximumWeeklyBudget;
    const cookingEffort: CookingEffort =
      effortParam === 'normal' || effortParam === 'enthusiastic'
        ? effortParam
        : effortParam === 'easy'
          ? effortParam
          : (preferences.cookingEffort ?? 'easy');
    const request: PlanRequest = {
      household,
      preferences: {
        ...preferences,
        maximumWeeklyBudget,
        cookingEffort,
        preferredRetailers: (retailersParam?.split(',') ??
          preferences.preferredRetailers) as RetailerId[],
        dailyCalorieTarget: householdTargets.caloriesKcal,
        dailyProteinTargetG: householdTargets.proteinG,
        dailyFibreTargetG: householdTargets.fibreG,
      },
      weekStarting: monday.toISOString().slice(0, 10),
      durationDays: Number(daysParam) === 3 ? 3 : Number(daysParam) === 5 ? 5 : 7,
      mealsPerDay: (mealsParam?.split(',') ?? ['breakfast', 'lunch', 'dinner']) as MealType[],
    };
    try {
      await generatePlan(request);
      router.replace('/plan-summary');
    } catch {
      setError(copy.generating.failed);
    }
  }, [
    budgetParam,
    daysParam,
    effortParam,
    generatePlan,
    mealsParam,
    onboardingDraft.adults,
    onboardingDraft.children,
    onboardingDraft.members,
    retailersParam,
    state.profile?.preferences,
  ]);

  useEffect(() => {
    const timer = setInterval(
      () => setStep((current) => Math.min(current + 1, copy.generating.steps.length - 1)),
      650,
    );
    if (!started.current) {
      started.current = true;
      void run();
    }
    return () => clearInterval(timer);
  }, [run]);

  return (
    <Screen scroll={false} contentStyle={styles.content}>
      <Blob size={180} color={colors.mustardSoft} top={-40} right={-50} />
      {error ? (
        <>
          <MabelInsight title={copy.generating.retryTitle}>{error}</MabelInsight>
          <PrimaryButton label={copy.common.tryAgain} onPress={run} />
        </>
      ) : (
        <>
          <LoadingMabel label={copy.generating.steps[step] ?? copy.components.loadingDefault} />
          <AppText tone="muted" style={styles.center}>
            {copy.generating.body}
          </AppText>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { justifyContent: 'center', gap: spacing.xxl, overflow: 'hidden' },
  center: { textAlign: 'center' },
});
