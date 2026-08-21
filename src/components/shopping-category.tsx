import { type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { Card } from '@/components/card';
import { copy } from '@/copy';
import { spacing } from '@/theme';

export type ShoppingCategoryProps = {
  title: string;
  count?: number;
  children: ReactNode;
};

export function ShoppingCategory({ title, count, children }: ShoppingCategoryProps) {
  return (
    <View style={styles.shoppingCategory}>
      <View style={styles.categoryHeader}>
        <AppText variant="h3">{title}</AppText>
        {count !== undefined ? (
          <AppText variant="caption" tone="muted">
            {copy.common.items(count)}
          </AppText>
        ) : null}
      </View>
      <Card style={styles.categoryCard}>{children}</Card>
    </View>
  );
}

const styles = StyleSheet.create({
  shoppingCategory: { gap: spacing.sm },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  categoryCard: { paddingVertical: 0 },
});
