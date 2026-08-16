import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import {
  AppText,
  Blob,
  MabelAvatar,
  PrimaryButton,
  Screen,
  SecondaryButton,
} from '@/components';
import { copy } from '@/copy';
import { colors, spacing } from '@/theme';

export default function WelcomeScreen() {
  return (
    <Screen scroll={false} contentStyle={styles.content}>
      <Blob size={200} color={colors.sageSoft} top={-50} left={-60} />
      <Blob size={180} color={colors.mustardSoft} bottom={-40} right={-50} />
      <View style={styles.hero}>
        <MabelAvatar size={132} />
        <AppText variant="display" style={styles.center}>
          {copy.welcome.headline}
        </AppText>
        <AppText tone="muted" style={styles.center}>
          {copy.welcome.body}
        </AppText>
      </View>
      <View style={styles.actions}>
        <PrimaryButton
          label={copy.welcome.getStarted}
          onPress={() => router.push('/(onboarding)/household')}
        />
        <SecondaryButton
          label={copy.welcome.haveAccount}
          onPress={() => router.push('/(onboarding)/household')}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: spacing.xxxl,
    overflow: 'hidden',
  },
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.xl },
  center: { textAlign: 'center' },
  actions: { gap: spacing.md },
});
