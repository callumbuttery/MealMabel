import { StyleSheet, View } from 'react-native';

import { copy } from '@/copy';
import { colors, shadows } from '@/theme';

export type MabelAvatarProps = {
  size?: number;
  accessibilityLabel?: string;
  /** Outlined "sticker" treatment (thick border, hard offset shadow, blush cheeks) — the Welcome hero avatar only. */
  sticker?: boolean;
};

export function MabelAvatar({
  size = 64,
  accessibilityLabel = copy.a11y.mabelAssistant,
  sticker = false,
}: MabelAvatarProps) {
  return (
    <View
      accessible
      accessibilityLabel={accessibilityLabel}
      style={[styles.avatar, { width: size, height: size }]}
    >
      {sticker ? (
        <View
          style={[
            styles.avatarShadow,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              transform: [{ translateX: size * 0.04 }, { translateY: size * 0.053 }],
            },
          ]}
        />
      ) : null}
      <View
        style={[
          styles.avatarOuter,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: colors.peach,
            borderWidth: sticker ? Math.max(2, size * 0.027) : 0,
          },
        ]}
      />
      <View
        style={[
          styles.avatarInner,
          sticker ? shadows.none : shadows.sm,
          {
            width: size * 0.91,
            height: size * 0.91,
            top: size * 0.045,
            left: size * 0.045,
            borderRadius: (size * 0.91) / 2,
            backgroundColor: colors.peachDeep,
          },
        ]}
      />
      {sticker ? (
        <>
          <View
            style={[
              styles.avatarCheek,
              {
                width: size * 0.12,
                height: size * 0.087,
                top: size * 0.547,
                left: size * 0.173,
                borderRadius: size * 0.087,
              },
            ]}
          />
          <View
            style={[
              styles.avatarCheek,
              {
                width: size * 0.12,
                height: size * 0.087,
                top: size * 0.547,
                right: size * 0.173,
                borderRadius: size * 0.087,
              },
            ]}
          />
        </>
      ) : null}
      <View
        style={[
          styles.avatarCap,
          {
            width: size * 0.47,
            height: size * 0.297,
            top: -size * 0.078,
            left: size * 0.266,
            borderRadius: size * 0.2,
            borderWidth: Math.max(1.5, size * 0.02),
          },
        ]}
      />
      <View
        style={[
          styles.avatarBand,
          {
            width: size * 0.688,
            height: size * 0.156,
            top: size * 0.109,
            left: size * 0.156,
            borderRadius: size * 0.08,
            borderWidth: Math.max(1.5, size * 0.02),
          },
        ]}
      />
      <View
        style={[
          styles.avatarEye,
          {
            width: size * 0.063,
            height: size * 0.08,
            top: size * 0.46,
            left: size * 0.31,
            borderRadius: size * 0.04,
          },
        ]}
      />
      <View
        style={[
          styles.avatarEye,
          {
            width: size * 0.063,
            height: size * 0.08,
            top: size * 0.46,
            right: size * 0.31,
            borderRadius: size * 0.04,
          },
        ]}
      />
      <View
        style={[
          styles.avatarSmile,
          {
            width: size * 0.219,
            height: size * 0.109,
            top: size * 0.609,
            left: size * 0.3905,
            borderBottomWidth: Math.max(1.5, size * 0.023),
            borderBottomLeftRadius: size * 0.156,
            borderBottomRightRadius: size * 0.156,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: { alignItems: 'center', justifyContent: 'center' },
  avatarShadow: { position: 'absolute', backgroundColor: colors.cocoa },
  avatarOuter: { position: 'absolute', top: 0, left: 0, borderColor: colors.cocoa },
  avatarInner: { position: 'absolute' },
  avatarCheek: { position: 'absolute', backgroundColor: colors.coral, opacity: 0.55 },
  avatarCap: {
    position: 'absolute',
    backgroundColor: colors.white,
    borderColor: colors.cocoa,
  },
  avatarBand: {
    position: 'absolute',
    backgroundColor: colors.white,
    borderColor: colors.cocoa,
  },
  avatarEye: { position: 'absolute', backgroundColor: colors.cocoa },
  avatarSmile: {
    position: 'absolute',
    borderBottomColor: colors.coralDark,
  },
});
