import { StyleSheet, TextInput, View } from 'react-native';

import { AppText } from '@/components/app-text';
import type { AppTextInputProps } from '@/components/text-input';
import { radii, spacing, typography, useMealMabelTheme } from '@/theme';

export type CurrencyInputProps = Omit<
  AppTextInputProps,
  'value' | 'onChangeText' | 'keyboardType'
> & {
  value: string;
  onChangeValue: (value: string) => void;
  currencySymbol?: string;
};

export function CurrencyInput({
  value,
  onChangeValue,
  currencySymbol = '£',
  label,
  error,
  helperText,
  style,
  accessibilityLabel,
  ...props
}: CurrencyInputProps) {
  const theme = useMealMabelTheme();
  return (
    <View style={styles.inputGroup}>
      <AppText variant="label">{label}</AppText>
      <View
        style={[
          styles.currencyShell,
          {
            backgroundColor: theme.surface,
            borderColor: error ? theme.danger : theme.border,
          },
        ]}
      >
        <AppText variant="bodyStrong" tone="muted">
          {currencySymbol}
        </AppText>
        <TextInput
          {...props}
          accessibilityLabel={accessibilityLabel ?? label}
          allowFontScaling
          keyboardType="decimal-pad"
          placeholderTextColor={theme.textMuted}
          selectionColor={theme.primary}
          value={value}
          onChangeText={(next) => onChangeValue(next.replace(/[^0-9.,]/g, '').replace(',', '.'))}
          style={[styles.currencyInput, { color: theme.text }, style]}
        />
      </View>
      {error ? (
        <AppText variant="caption" tone="danger" accessibilityLiveRegion="polite">
          {error}
        </AppText>
      ) : helperText ? (
        <AppText variant="caption" tone="muted">
          {helperText}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  inputGroup: { gap: spacing.xs },
  currencyShell: {
    minHeight: 52,
    borderRadius: radii.md,
    borderWidth: 2,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  currencyInput: {
    flex: 1,
    minHeight: 50,
    paddingVertical: spacing.sm,
    ...typography.body,
  },
});
