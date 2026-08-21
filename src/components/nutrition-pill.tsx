import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import type { IconName } from '@/components/icon-name';
import { radii, spacing, useMealMabelTheme } from '@/theme';

export type NutritionPillProps = {
  label: string;
  value: string;
  icon?: IconName;
};

export function NutritionPill({ label, value, icon }: NutritionPillProps) {
  const theme = useMealMabelTheme();
  return (
    <View
      accessibilityLabel={`${label}: ${value}`}
      style={[styles.nutritionPill, { backgroundColor: theme.surfaceMuted }]}
    >
      {icon ? <Ionicons name={icon} color={theme.accent} size={16} /> : null}
      <AppText variant="caption" tone="muted">
        {label}
      </AppText>
      <AppText variant="label">{value}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  nutritionPill: {
    minHeight: 36,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
});
