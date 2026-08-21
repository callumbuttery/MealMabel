import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText, Blob, MabelAvatar, SecondaryButton } from '@/components';
import { copy } from '@/copy';
import { colors, radii, spacing } from '@/theme';

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.screen}>
      <Blob size={150} color={colors.mustard} top={60} left={-40} rotate="8deg" />
      <Blob size={110} color={colors.sage} top={130} right={-50} opacity={0.9} />
      <AppText style={[styles.star, styles.starTopRight]}>✦</AppText>
      <AppText style={[styles.star, styles.starMid]}>✦</AppText>
      <View style={styles.hero}>
        <MabelAvatar size={150} sticker accessibilityLabel={copy.a11y.mabel} />
        <AppText variant="display" tone="inverse" style={styles.center}>
          {copy.welcome.headline}
        </AppText>
        <AppText variant="bodyStrong" tone="inverse" style={styles.center}>
          {copy.welcome.body}
        </AppText>
      </View>
      <View style={styles.sheet}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={copy.welcome.getStarted}
          onPress={() => router.push('/(onboarding)/household')}
          style={({ pressed }) => [styles.solidButton, { opacity: pressed ? 0.85 : 1 }]}
        >
          <AppText variant="button" tone="inverse">
            {copy.welcome.getStarted}
          </AppText>
        </Pressable>
        <SecondaryButton
          label={copy.welcome.haveAccount}
          onPress={() => router.push({ pathname: '/login', params: { from: 'welcome' } })}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.coral, overflow: 'hidden' },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
    paddingHorizontal: spacing.xxl,
  },
  center: { textAlign: 'center' },
  star: {
    position: 'absolute',
    fontSize: 26,
    fontWeight: '700',
    color: colors.creamDeep,
  },
  starTopRight: { top: 60, right: 28, transform: [{ rotate: '12deg' }] },
  starMid: {
    top: 260,
    left: 34,
    fontSize: 20,
    color: colors.cocoa,
    transform: [{ rotate: '-10deg' }],
  },
  sheet: {
    backgroundColor: colors.creamDeep,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxxl,
    gap: spacing.md,
  },
  solidButton: {
    minHeight: 52,
    borderRadius: radii.pill,
    backgroundColor: colors.cocoa,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
});
