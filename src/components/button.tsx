import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet } from 'react-native';

import { AppText } from '@/components/app-text';
import type { IconName } from '@/components/icon-name';
import { LoadingMabel } from '@/components/loading-mabel';
import { copy } from '@/copy';
import { layout, radii, shadows, spacing, useMealMabelTheme } from '@/theme';

export type ButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: IconName;
  accessibilityHint?: string;
};

function Button({
  label,
  onPress,
  disabled = false,
  loading = false,
  icon,
  accessibilityHint,
  secondary,
}: ButtonProps & { secondary: boolean }) {
  const theme = useMealMabelTheme();
  const blocked = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: blocked, busy: loading }}
      disabled={blocked}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        secondary ? shadows.none : shadows.md,
        {
          backgroundColor: secondary
            ? theme.background
            : pressed
              ? theme.primaryPressed
              : theme.primary,
          borderColor: theme.primary,
          borderWidth: secondary ? 2 : 0,
          opacity: blocked ? 0.5 : pressed ? 0.9 : 1,
        },
      ]}
    >
      {loading ? (
        <LoadingMabel compact accessibilityLabel={copy.a11y.loading(label)} />
      ) : (
        <>
          {icon ? (
            <Ionicons
              name={icon}
              size={20}
              color={secondary ? theme.primary : theme.primaryContrast}
            />
          ) : null}
          <AppText variant="button" tone={secondary ? 'primary' : 'inverse'}>
            {label}
          </AppText>
        </>
      )}
    </Pressable>
  );
}

export function PrimaryButton(props: ButtonProps) {
  return <Button {...props} secondary={false} />;
}

export function SecondaryButton(props: ButtonProps) {
  return <Button {...props} secondary />;
}

const styles = StyleSheet.create({
  button: {
    minHeight: layout.minTouchTarget,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
});
