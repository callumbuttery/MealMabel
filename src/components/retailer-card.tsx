import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { RetailerLogo } from '@/components/retailer-logo';
import { sharedStyles } from '@/components/shared-styles';
import { copy } from '@/copy';
import { radii, shadows, spacing, useMealMabelTheme } from '@/theme';

export type RetailerCardProps = {
  name: string;
  price: string;
  itemCount?: number;
  selected?: boolean;
  bestValue?: boolean;
  onPress?: () => void;
  logoColor?: string;
};

export function RetailerCard({
  name,
  price,
  itemCount,
  selected = false,
  bestValue = false,
  onPress,
  logoColor,
}: RetailerCardProps) {
  const theme = useMealMabelTheme();
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={`${name}, ${price}${bestValue ? copy.components.bestValueSuffix : ''}`}
      accessibilityState={{ selected }}
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.retailerCard,
        shadows.sm,
        {
          backgroundColor: selected || bestValue ? theme.accentSoft : theme.surface,
          borderColor: selected || bestValue ? theme.accent : theme.border,
          opacity: pressed ? 0.75 : 1,
        },
      ]}
    >
      <RetailerLogo name={name} color={logoColor ?? (bestValue ? theme.accent : undefined)} />
      <View style={sharedStyles.flex}>
        <View style={sharedStyles.inline}>
          <AppText variant="bodyStrong">{name}</AppText>
          {bestValue ? (
            <View style={[styles.valueBadge, { backgroundColor: theme.accent }]}>
              <Ionicons name="sparkles" size={13} color={theme.primaryContrast} />
              <AppText variant="caption" tone="inverse">
                {copy.components.bestValue}
              </AppText>
            </View>
          ) : null}
        </View>
        {itemCount !== undefined ? (
          <AppText variant="caption" tone="muted">
            {copy.common.items(itemCount)}
          </AppText>
        ) : null}
      </View>
      <AppText variant="h3">{price}</AppText>
      {selected ? <Ionicons name="checkmark-circle" size={22} color={theme.accent} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  retailerCard: {
    minHeight: 76,
    borderRadius: radii.lg,
    borderWidth: 2,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  valueBadge: {
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
});
