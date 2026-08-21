import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import type { IconName } from '@/components/icon-name';
import { radii, spacing, useMealMabelTheme } from '@/theme';

export type NumberStepperProps = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label: string;
};

export function NumberStepper({
  value,
  onChange,
  min = 0,
  max = Number.MAX_SAFE_INTEGER,
  step = 1,
  label,
}: NumberStepperProps) {
  const theme = useMealMabelTheme();
  const decreaseDisabled = value <= min;
  const increaseDisabled = value >= max;
  return (
    <View
      accessibilityRole="adjustable"
      accessibilityLabel={label}
      accessibilityValue={{ min, max, now: value, text: String(value) }}
      style={[styles.stepper, { borderColor: theme.border, backgroundColor: theme.surface }]}
    >
      <StepperButton
        icon="remove"
        label={`Decrease ${label}`}
        disabled={decreaseDisabled}
        onPress={() => onChange(Math.max(min, value - step))}
      />
      <AppText variant="h3" style={styles.stepperValue}>
        {value}
      </AppText>
      <StepperButton
        icon="add"
        label={`Increase ${label}`}
        disabled={increaseDisabled}
        onPress={() => onChange(Math.min(max, value + step))}
      />
    </View>
  );
}

function StepperButton({
  icon,
  label,
  disabled,
  onPress,
}: {
  icon: IconName;
  label: string;
  disabled: boolean;
  onPress: () => void;
}) {
  const theme = useMealMabelTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      hitSlop={4}
      onPress={onPress}
      style={({ pressed }) => [
        styles.stepperButton,
        {
          backgroundColor: theme.surfaceMuted,
          opacity: disabled ? 0.4 : pressed ? 0.75 : 1,
        },
      ]}
    >
      <Ionicons name={icon} size={18} color={theme.text} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  stepper: {
    minHeight: 48,
    borderRadius: radii.pill,
    borderWidth: 2,
    paddingHorizontal: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  stepperButton: {
    width: 32,
    height: 32,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperValue: { minWidth: 20, textAlign: 'center' },
});
