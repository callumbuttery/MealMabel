import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet } from 'react-native';

import { useMealMabelApp, usePlanData } from '@/app-state/app-provider';
import {
  AppText,
  Blob,
  LoadingMabel,
  MabelInsight,
  PrimaryButton,
  Screen,
  SecondaryButton,
} from '@/components';
import {
  aggregateHouseholdTargets,
  createHousehold,
  mergePreferenceAllergens,
  requiredHouseholdDiet,
  stricterDiet,
  type CookingEffort,
  type DietType,
  type MealType,
  type PlanRequest,
  type RetailerId,
} from '@/domain';
import { copy, formatGbp } from '@/copy';
import { NoSafePlanError } from '@/services';
import { colors, spacing } from '@/theme';

interface GenerationFailure {
  message: string;
  safeRefusal: boolean;
}

interface BudgetNotice {
  total: string;
  budget: string;
}

export default function GeneratingScreen() {
  const params = useLocalSearchParams<{
    budget?: string;
    days?: string;
    meals?: string;
    retailers?: string;
    effort?: string;
    diet?: string;
  }>();
  const { state, onboardingDraft, generatePlan } = useMealMabelApp();
  const { comparison } = usePlanData();
  const [step, setStep] = useState(0);
  const [error, setError] = useState<GenerationFailure | null>(null);
  const [awaitingBudgetCheck, setAwaitingBudgetCheck] = useState(false);
  const [budgetNotice, setBudgetNotice] = useState<BudgetNotice | null>(null);
  const requestBudget = useRef<number | null>(null);
  const started = useRef(false);
  const budgetParam = params.budget;
  const daysParam = params.days;
  const mealsParam = params.meals;
  const retailersParam = params.retailers;
  const effortParam = params.effort;
  const dietParam = params.diet;

  const run = useCallback(async () => {
    setError(null);
    const preferences = state.profile?.preferences;
    if (!preferences) {
      setError({
        message: copy.generating.missingPreferences,
        safeRefusal: false,
      });
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
    const requestedDiet: DietType =
      dietParam === 'vegan' || dietParam === 'vegetarian' || dietParam === 'pescatarian'
        ? dietParam
        : dietParam === 'anything'
          ? dietParam
          : (preferences.dietType ?? 'anything');
    const dietType = stricterDiet(requestedDiet, requiredHouseholdDiet(household.members));
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
        dietType,
        dietaryPreferences: dietType === 'anything' ? ['none'] : [dietType],
        allergens: mergePreferenceAllergens(preferences, household.members),
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
      requestBudget.current = maximumWeeklyBudget;
      setAwaitingBudgetCheck(true);
    } catch (cause) {
      if (cause instanceof NoSafePlanError) {
        const mealTypes = cause.mealTypes
          .map((mealType) => copy.mealTypes[mealType].toLowerCase())
          .join(', ');
        setError({
          message: copy.generating.safeFailure(mealTypes),
          safeRefusal: true,
        });
      } else {
        setError({
          message: copy.generating.failed,
          safeRefusal: false,
        });
      }
    }
  }, [
    budgetParam,
    daysParam,
    dietParam,
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

  useEffect(() => {
    if (!awaitingBudgetCheck || !comparison || requestBudget.current === null) {
      return;
    }
    const best = comparison.baskets.find(
      (basket) => basket.retailerId === comparison.cheapestRetailerId,
    );
    setAwaitingBudgetCheck(false);
    if (best && best.subtotal > requestBudget.current) {
      setBudgetNotice({
        total: formatGbp(best.subtotal),
        budget: formatGbp(requestBudget.current),
      });
    } else {
      router.replace('/plan-summary');
    }
  }, [awaitingBudgetCheck, comparison]);

  return (
    <Screen scroll={false} contentStyle={styles.content}>
      <Blob size={180} color={colors.mustardSoft} top={-40} right={-50} />
      {error ? (
        <>
          <MabelInsight
            title={
              error.safeRefusal ? copy.generating.safeFailureTitle : copy.generating.retryTitle
            }
          >
            {error.message}
          </MabelInsight>
          <PrimaryButton
            label={error.safeRefusal ? copy.generating.changeChoices : copy.common.tryAgain}
            onPress={error.safeRefusal ? () => router.back() : run}
          />
        </>
      ) : budgetNotice ? (
        <>
          <MabelInsight title={copy.generating.budgetFailureTitle}>
            {copy.generating.budgetFailure(budgetNotice.total, budgetNotice.budget)}
          </MabelInsight>
          <PrimaryButton
            label={copy.generating.continueAnyway}
            onPress={() => router.replace('/plan-summary')}
          />
          <SecondaryButton label={copy.generating.changeChoices} onPress={() => router.back()} />
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
