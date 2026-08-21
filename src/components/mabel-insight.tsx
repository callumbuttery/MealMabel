import { type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { Badge } from '@/components/badge';
import { MabelAvatar } from '@/components/mabel-avatar';
import { sharedStyles } from '@/components/shared-styles';
import { copy } from '@/copy';
import { layout, radii, spacing, useMealMabelTheme } from '@/theme';

export type MabelInsightProps = {
  title?: string;
  badgeLabel?: string;
  children: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
};

export function MabelInsight({
  title = copy.components.mabelTip,
  badgeLabel,
  children,
  actionLabel,
  onAction,
}: MabelInsightProps) {
  const theme = useMealMabelTheme();
  return (
    <View
      accessibilityRole="summary"
      style={[styles.insight, { backgroundColor: theme.warningSoft, borderColor: theme.warning }]}
    >
      {badgeLabel ? <Badge label={badgeLabel} /> : <MabelAvatar size={52} />}
      <View style={sharedStyles.flex}>
        {badgeLabel ? null : <AppText variant="label">{title}</AppText>}
        {typeof children === 'string' ? (
          <AppText>
            {badgeLabel ? <AppText variant="bodyStrong">{title} </AppText> : null}
            {children}
          </AppText>
        ) : (
          children
        )}
        {actionLabel && onAction ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={actionLabel}
            onPress={onAction}
            style={styles.insightAction}
          >
            <AppText variant="label" tone="primary">
              {actionLabel} →
            </AppText>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  insight: {
    borderRadius: radii.lg,
    borderWidth: 2,
    borderStyle: 'dashed',
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  insightAction: {
    minHeight: layout.minTouchTarget,
    alignSelf: 'flex-start',
    justifyContent: 'center',
  },
});
