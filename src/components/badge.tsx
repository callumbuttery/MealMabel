import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { colors, radii, spacing, useMealMabelTheme } from '@/theme';

export type BadgeProps = {
  label: string;
  tone?: 'warning' | 'accent';
};

export function Badge({ label, tone = 'warning' }: BadgeProps) {
  const theme = useMealMabelTheme();
  const backgroundColor = tone === 'warning' ? theme.warning : theme.accent;
  const color = tone === 'warning' ? colors.cocoa : theme.primaryContrast;
  return (
    <View style={[styles.badge, { backgroundColor }]}>
      <Ionicons name="star" size={11} color={color} />
      <AppText variant="caption" style={[styles.badgeLabel, { color }]}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    transform: [{ rotate: '-3deg' }],
  },
  badgeLabel: { textTransform: 'uppercase', letterSpacing: 0.4 },
});
