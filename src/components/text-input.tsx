import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { AppText } from '@/components/app-text';
import { radii, spacing, typography, useMealMabelTheme } from '@/theme';

export type AppTextInputProps = TextInputProps & {
  label: string;
  error?: string;
  helperText?: string;
};

export function AppTextInput({
  label,
  error,
  helperText,
  style,
  accessibilityLabel,
  ...props
}: AppTextInputProps) {
  const theme = useMealMabelTheme();
  return (
    <View style={styles.inputGroup}>
      <AppText variant="label">{label}</AppText>
      <TextInput
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityHint={error ?? helperText}
        allowFontScaling
        placeholderTextColor={theme.textMuted}
        selectionColor={theme.primary}
        style={[
          styles.textInput,
          {
            color: theme.text,
            backgroundColor: theme.surface,
            borderColor: error ? theme.danger : theme.border,
          },
          style,
        ]}
        {...props}
      />
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
  textInput: {
    minHeight: 52,
    borderRadius: radii.md,
    borderWidth: 2,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...typography.body,
  },
});
