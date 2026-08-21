import { useEffect, useState } from 'react';
import { AccessibilityInfo, Animated, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { MabelAvatar } from '@/components/mabel-avatar';
import { copy } from '@/copy';
import { colors, spacing } from '@/theme';

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    let mounted = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (mounted) setReduced(enabled);
    });
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduced);
    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);
  return reduced;
}

export type LoadingMabelProps = {
  label?: string;
  compact?: boolean;
  accessibilityLabel?: string;
};

export function LoadingMabel({
  label = copy.components.loadingDefault,
  compact = false,
  accessibilityLabel = label,
}: LoadingMabelProps) {
  const reducedMotion = useReducedMotion();
  const [animation] = useState(() => new Animated.Value(0));
  useEffect(() => {
    if (reducedMotion) {
      animation.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(animation, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(animation, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [animation, reducedMotion]);

  return (
    <View
      accessible
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="progressbar"
      accessibilityLiveRegion="polite"
      style={[styles.loading, compact && styles.loadingCompact]}
    >
      <Animated.View
        style={{
          opacity: reducedMotion
            ? 1
            : animation.interpolate({
                inputRange: [0, 1],
                outputRange: [0.65, 1],
              }),
          transform: [
            {
              translateY: reducedMotion
                ? 0
                : animation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -4],
                  }),
            },
          ],
        }}
      >
        <MabelAvatar size={compact ? 28 : 64} accessibilityLabel={copy.a11y.mabel} />
      </Animated.View>
      {!compact ? (
        <>
          <View style={styles.loadingDots}>
            <View style={[styles.loadingDot, { backgroundColor: colors.coral }]} />
            <View style={[styles.loadingDot, { backgroundColor: colors.mustard }]} />
            <View style={[styles.loadingDot, { backgroundColor: colors.sage }]} />
          </View>
          <AppText variant="label" tone="muted">
            {label}
          </AppText>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  loading: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.xl,
  },
  loadingCompact: { padding: 0 },
  loadingDots: { flexDirection: 'row', gap: spacing.sm },
  loadingDot: { width: 9, height: 9, borderRadius: 5 },
});
