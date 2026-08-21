import { type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { IconButton } from '@/components/icon-button';
import { copy } from '@/copy';
import { spacing } from '@/theme';

export type AppHeaderProps = {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  action?: ReactNode;
};

export function AppHeader({ title, subtitle, onBack, action }: AppHeaderProps) {
  return (
    <View style={styles.header}>
      {onBack ? (
        <IconButton icon="arrow-back" label={copy.a11y.back} onPress={onBack} />
      ) : (
        <View style={styles.headerSpacer} />
      )}
      <View style={styles.headerCopy}>
        <AppText variant="h2" numberOfLines={2} style={styles.headerTitle}>
          {title}
        </AppText>
        {subtitle ? (
          <AppText variant="caption" tone="muted" numberOfLines={2} style={styles.headerTitle}>
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {action ?? <View style={styles.headerSpacer} />}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerSpacer: { width: 48, height: 48 },
  headerCopy: { flex: 1, alignItems: 'center', gap: spacing.xxs },
  headerTitle: { textAlign: 'center' },
});
