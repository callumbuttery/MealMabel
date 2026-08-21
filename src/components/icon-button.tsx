import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet } from 'react-native';

import type { IconName } from '@/components/icon-name';
import { layout, radii, useMealMabelTheme } from '@/theme';

export type IconButtonProps = {
  icon: IconName;
  label: string;
  onPress: () => void;
  disabled?: boolean;
  size?: 'small' | 'medium';
};

export function IconButton({
  icon,
  label,
  onPress,
  disabled = false,
  size = 'medium',
}: IconButtonProps) {
  const theme = useMealMabelTheme();
  const dimension = size === 'small' ? layout.minTouchTarget : 48;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      hitSlop={4}
      onPress={onPress}
      style={({ pressed }) => [
        styles.iconButton,
        {
          width: dimension,
          height: dimension,
          backgroundColor: pressed ? theme.surfaceMuted : theme.surface,
          borderColor: theme.border,
          opacity: disabled ? 0.45 : 1,
        },
      ]}
    >
      <Ionicons name={icon} size={size === 'small' ? 20 : 23} color={theme.text} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  iconButton: {
    borderRadius: radii.pill,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
