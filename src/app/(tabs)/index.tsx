import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { useMealMabelApp, usePlanData } from '@/app-state/app-provider';
import {
  AppText,
  Card,
  MabelAvatar,
  MabelInsight,
  PrimaryButton,
  Screen,
  SecondaryButton,
} from '@/components';
import { copy, formatGbp } from '@/copy';
import { spacing } from '@/theme';

export default function HomeScreen() {
  const { state } = useMealMabelApp();
  const { comparison } = usePlanData();
  const plan = state.currentPlan;
  const best = comparison?.baskets.find(
    (basket) => basket.retailerId === comparison.cheapestRetailerId,
  );
  return (
    <Screen>
      <View style={styles.header}>
        <View style={styles.copy}>
          <AppText tone="muted">{copy.home.greeting}</AppText>
          <AppText variant="h1">{copy.home.headline}</AppText>
        </View>
        <MabelAvatar size={72} />
      </View>

      {plan ? (
        <>
          <AppText variant="h2">{copy.home.thisWeek}</AppText>
          <Card elevated style={styles.planCard}>
            <View style={styles.stats}>
              <Stat
                value={`${plan.days.reduce((n, day) => n + day.meals.length, 0)}`}
                label={copy.home.meals}
              />
              <Stat
                value={best ? formatGbp(best.subtotal) : copy.common.dash}
                label={copy.home.estimatedShop}
              />
              <Stat value={best?.retailerName ?? copy.home.comparing} label={copy.home.bestShop} />
            </View>
            <MabelInsight title={copy.home.weekSorted}>
              {best
                ? copy.home.underBudget(formatGbp(Math.max(0, 60 - best.subtotal)))
                : copy.home.checkingShop}
            </MabelInsight>
            <PrimaryButton label={copy.home.viewPlan} onPress={() => router.push('/(tabs)/plan')} />
            <SecondaryButton
              label={copy.home.viewList}
              onPress={() => router.push('/(tabs)/shop')}
            />
          </Card>
        </>
      ) : (
        <Card elevated style={styles.heroCard}>
          <AppText variant="h2">{copy.home.planWeek}</AppText>
          <AppText tone="muted">{copy.home.planWeekBody}</AppText>
          <PrimaryButton
            label={copy.home.startPlanning}
            onPress={() => router.push('/create-plan')}
          />
        </Card>
      )}

      <Card style={styles.secondaryCard}>
        <AppText variant="h3">{copy.home.compareTitle}</AppText>
        <AppText tone="muted">{copy.home.compareBody}</AppText>
        <SecondaryButton
          label={copy.home.compareCta}
          onPress={() => router.push('/compare-shop')}
        />
      </Card>
      {plan ? (
        <SecondaryButton
          label={copy.home.planDifferentWeek}
          onPress={() => router.push('/create-plan')}
        />
      ) : null}
    </Screen>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.stat}>
      <AppText variant="h3">{value}</AppText>
      <AppText variant="caption" tone="muted">
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  copy: { flex: 1, gap: spacing.xs },
  heroCard: { gap: spacing.lg, paddingVertical: spacing.xxl },
  planCard: { gap: spacing.lg },
  stats: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm },
  stat: { flex: 1 },
  secondaryCard: { gap: spacing.md },
});
