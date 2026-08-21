import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { PrimaryButton } from '@/components/button';
import type { IconName } from '@/components/icon-name';
import { sharedStyles } from '@/components/shared-styles';
import { spacing, useMealMabelTheme } from '@/theme';

export type EmptyStateProps = {
  title: string;
  message: string;
  icon?: IconName;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({
  title,
  message,
  icon = 'basket-outline',
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const theme = useMealMabelTheme();
  return (
    <View style={styles.emptyState}>
      <View style={[styles.emptyIcon, { backgroundColor: theme.surfaceMuted }]}>
        <Ionicons name={icon} size={34} color={theme.primary} />
      </View>
      <AppText variant="h2" style={sharedStyles.center}>
        {title}
      </AppText>
      <AppText tone="muted" style={sharedStyles.center}>
        {message}
      </AppText>
      {actionLabel && onAction ? <PrimaryButton label={actionLabel} onPress={onAction} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.xxxl,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
