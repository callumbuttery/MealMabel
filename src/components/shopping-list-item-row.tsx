import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { layout, radii, spacing, useMealMabelTheme } from '@/theme';

export type ShoppingListItemRowProps = {
  name: string;
  quantity?: string;
  price?: string;
  checked: boolean;
  onToggle: () => void;
  onPress?: () => void;
};

export function ShoppingListItemRow({
  name,
  quantity,
  price,
  checked,
  onToggle,
  onPress,
}: ShoppingListItemRowProps) {
  const theme = useMealMabelTheme();
  return (
    <View style={[styles.shoppingRow, { borderBottomColor: theme.border }]}>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityLabel={`${name}${quantity ? `, ${quantity}` : ''}`}
        accessibilityState={{ checked }}
        hitSlop={6}
        onPress={onToggle}
        style={[
          styles.checkbox,
          {
            backgroundColor: checked ? theme.accent : theme.surface,
            borderColor: checked ? theme.accent : theme.border,
          },
        ]}
      >
        {checked ? <Ionicons name="checkmark" size={19} color={theme.primaryContrast} /> : null}
      </Pressable>
      <Pressable
        accessibilityRole={onPress ? 'button' : undefined}
        disabled={!onPress}
        onPress={onPress}
        style={styles.shoppingCopy}
      >
        <AppText
          variant="bodyStrong"
          tone={checked ? 'muted' : 'default'}
          style={checked ? styles.strikethrough : undefined}
        >
          {name}
        </AppText>
        {quantity ? (
          <AppText variant="caption" tone="muted">
            {quantity}
          </AppText>
        ) : null}
      </Pressable>
      {price ? (
        <AppText variant="label" tone={checked ? 'muted' : 'default'}>
          {price}
        </AppText>
      ) : null}
    </View>
  );
}

/** Alias kept for ergonomic UI imports without sharing a domain-model type. */
export const ShoppingListRow = ShoppingListItemRow;
export type ShoppingListRowProps = ShoppingListItemRowProps;

const styles = StyleSheet.create({
  shoppingRow: {
    minHeight: 62,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: radii.xs,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shoppingCopy: {
    flex: 1,
    minHeight: layout.minTouchTarget,
    justifyContent: 'center',
  },
  strikethrough: { textDecorationLine: 'line-through' },
});
