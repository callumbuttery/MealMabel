import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { copy } from '@/copy';
import { radii, spacing, useMealMabelTheme } from '@/theme';

export type BudgetProgressProps = {
  spent: number;
  budget: number;
  currencySymbol?: string;
};

export function BudgetProgress({ spent, budget, currencySymbol = '£' }: BudgetProgressProps) {
  const theme = useMealMabelTheme();
  const ratio = budget > 0 ? Math.min(Math.max(spent / budget, 0), 1) : 0;
  const over = spent > budget;
  const percent = Math.round(ratio * 100);
  return (
    <View
      accessible
      accessibilityLabel={copy.components.spentOf(
        `${currencySymbol}${spent.toFixed(2)}`,
        `${currencySymbol}${budget.toFixed(2)}`,
      )}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: percent }}
      style={styles.budget}
    >
      <View style={styles.budgetLabels}>
        <AppText variant="label">
          {over ? copy.components.overBudget : copy.components.weeklyBudget}
        </AppText>
        <AppText variant="label" tone={over ? 'danger' : 'default'}>
          {currencySymbol}
          {spent.toFixed(2)} / {currencySymbol}
          {budget.toFixed(2)}
        </AppText>
      </View>
      <View style={[styles.progressTrack, { backgroundColor: theme.surfaceMuted }]}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${percent}%`,
              backgroundColor: over ? theme.danger : theme.accent,
            },
          ]}
        />
      </View>
      <AppText variant="caption" tone={over ? 'danger' : 'muted'}>
        {over
          ? copy.components.overBy(`${currencySymbol}${(spent - budget).toFixed(2)}`)
          : copy.components.remaining(`${currencySymbol}${Math.max(budget - spent, 0).toFixed(2)}`)}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  budget: { gap: spacing.sm },
  budgetLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  progressTrack: { height: 12, borderRadius: radii.pill, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: radii.pill },
});
