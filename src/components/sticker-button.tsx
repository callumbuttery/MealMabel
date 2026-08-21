import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import type { ButtonProps } from '@/components/button';
import { LoadingMabel } from '@/components/loading-mabel';
import { copy } from '@/copy';
import { colors, layout, radii, spacing } from '@/theme';

export type StickerButtonProps = ButtonProps & {
  backgroundColor: string;
  textColor: string;
  borderColor?: string;
};

/** Thick-outline pill with a hard offset shadow (no blur) — the Login/Signup "sticker" auth buttons. */
export function StickerButton({
  label,
  onPress,
  disabled = false,
  loading = false,
  icon,
  accessibilityHint,
  backgroundColor,
  textColor,
  borderColor = colors.cocoa,
}: StickerButtonProps) {
  const blocked = disabled || loading;
  return (
    <View style={styles.stickerWrap}>
      <View style={[styles.stickerShadow, { backgroundColor: borderColor }]} />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityHint={accessibilityHint}
        accessibilityState={{ disabled: blocked, busy: loading }}
        disabled={blocked}
        onPress={onPress}
        style={({ pressed }) => [
          styles.stickerButton,
          {
            backgroundColor,
            borderColor,
            opacity: blocked ? 0.5 : 1,
            transform: pressed ? [{ translateY: 3 }] : undefined,
          },
        ]}
      >
        {loading ? (
          <LoadingMabel compact accessibilityLabel={copy.a11y.loading(label)} />
        ) : (
          <>
            {icon ? <Ionicons name={icon} size={19} color={textColor} /> : null}
            <AppText variant="button" style={{ color: textColor }}>
              {label}
            </AppText>
          </>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  stickerWrap: { position: 'relative' },
  stickerShadow: {
    position: 'absolute',
    top: 5,
    left: 0,
    right: 0,
    bottom: -5,
    borderRadius: radii.pill,
  },
  stickerButton: {
    minHeight: layout.minTouchTarget,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radii.pill,
    borderWidth: 2.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
});
