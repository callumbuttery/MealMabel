import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { useMealMabelApp, usePlanData } from '@/app-state/app-provider';
import {
  AppText,
  Card,
  LoadingMabel,
  MabelAvatar,
  MabelInsight,
  PrimaryButton,
  Screen,
  SecondaryButton,
} from '@/components';
import { copy, formatGbp } from '@/copy';
import { spacing } from '@/theme';

export default function PlanSummaryScreen() {
  const { state } = useMealMabelApp();
  const { comparison, isLoading } = usePlanData();
  const plan = state.currentPlan;
  const best = comparison?.baskets.find(
    (basket) => basket.retailerId === comparison.cheapestRetailerId,
  );
  if (!plan || isLoading || !best) {
    return (
      <Screen scroll={false} contentStyle={styles.loading}>
        <LoadingMabel label={copy.planSummary.loading} />
      </Screen>
    );
  }
  const savings = comparison?.savingsAgainstMostExpensive ?? 0;
  const mealCount = plan.days.reduce((count, day) => count + day.meals.length, 0);
  const budget = state.profile?.preferences.maximumWeeklyBudget ?? 60;
  return (
    <Screen>
      <View style={styles.hero}>
        <MabelAvatar size={96} />
        <AppText variant="h1" style={styles.center}>
          {copy.planSummary.headline}
        </AppText>
      </View>
      <Card elevated>
        <View style={styles.grid}>
          <Metric value={`${mealCount}`} label={copy.planSummary.meals} />
          <Metric value={formatGbp(best.subtotal)} label={copy.planSummary.estimatedShop} />
          <Metric
            value={formatGbp(Math.max(0, budget - best.subtotal))}
            label={copy.planSummary.underBudget}
          />
          <Metric
            value={copy.planSummary.proteinValue(
              Math.round(plan.nutrition.proteinG / plan.days.length),
            )}
            label={copy.planSummary.proteinDay}
          />
        </View>
      </Card>
      <MabelInsight
        badgeLabel={copy.planSummary.recommendBadge}
        title={copy.planSummary.recommendTitle(best.retailerName)}
      >
        {copy.planSummary.recommendBody(formatGbp(best.subtotal), formatGbp(savings))}
      </MabelInsight>
      <PrimaryButton
        label={copy.planSummary.seeWeek}
        onPress={() => router.replace('/(tabs)/plan')}
      />
      <SecondaryButton
        label={copy.planSummary.seeList}
        onPress={() => router.replace('/(tabs)/shop')}
      />
    </Screen>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.metric}>
      <AppText variant="h2">{value}</AppText>
      <AppText variant="caption" tone="muted">{label}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  loading: { justifyContent: 'center' },
  hero: { alignItems: 'center', gap: spacing.md },
  center: { textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xl },
  metric: { width: '43%' },
});
