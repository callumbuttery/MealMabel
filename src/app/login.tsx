import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { useMealMabelApp } from '@/app-state/app-provider';
import {
  AppText,
  AppTextInput,
  Blob,
  IconButton,
  MabelAvatar,
  PrimaryButton,
  Screen,
  StickerButton,
} from '@/components';
import { copy } from '@/copy';
import type { AuthProvider } from '@/domain';
import { colors, spacing, useMealMabelTheme } from '@/theme';

export default function LoginScreen() {
  const params = useLocalSearchParams<{ from?: string }>();
  const { state, signIn } = useMealMabelApp();
  const theme = useMealMabelTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pending, setPending] = useState<AuthProvider | null>(null);
  const [error, setError] = useState<string>();

  const finish = () => {
    if (params.from === 'profile') {
      router.back();
    } else if (state.onboardingComplete) {
      router.replace('/(tabs)');
    } else {
      router.replace('/(onboarding)/household');
    }
  };

  const continueWith = async (provider: AuthProvider) => {
    setError(undefined);
    setPending(provider);
    try {
      await signIn(provider, provider === 'email' ? email : undefined);
      finish();
    } catch {
      setError(provider === 'email' ? copy.login.invalidEmail : copy.login.failed);
    } finally {
      setPending(null);
    }
  };

  return (
    <Screen contentStyle={styles.content}>
      <View style={styles.banner}>
        <Blob size={150} color={colors.mustard} top={-50} right={-40} opacity={0.85} />
        <Blob size={110} color={colors.coralDark} bottom={-40} left={-30} opacity={0.5} />
        <IconButton icon="arrow-back" label={copy.a11y.back} onPress={() => router.back()} />
        <View style={styles.bannerCopy}>
          <MabelAvatar size={72} accessibilityLabel={copy.a11y.mabel} />
          <AppText variant="h1" tone="inverse" style={styles.center}>
            {copy.login.title}
          </AppText>
          <AppText variant="bodyStrong" tone="inverse" style={styles.center}>
            {copy.login.subtitle}
          </AppText>
        </View>
      </View>
      <View style={styles.form}>
        <StickerButton
          label={copy.login.google}
          icon="logo-google"
          backgroundColor={colors.white}
          textColor={colors.cocoa}
          loading={pending === 'google'}
          disabled={pending !== null}
          onPress={() => continueWith('google')}
        />
        <StickerButton
          label={copy.login.apple}
          icon="logo-apple"
          backgroundColor={colors.cocoa}
          textColor={colors.white}
          loading={pending === 'apple'}
          disabled={pending !== null}
          onPress={() => continueWith('apple')}
        />
        <View style={styles.divider}>
          <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
          <AppText variant="label" tone="muted">
            {copy.login.or}
          </AppText>
          <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
        </View>
        <AppTextInput
          label={copy.login.emailLabel}
          placeholder={copy.login.emailPlaceholder}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          error={error}
        />
        <AppTextInput
          label={copy.login.passwordLabel}
          placeholder={copy.login.passwordPlaceholder}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="password"
        />
        <PrimaryButton
          label={copy.login.cta}
          loading={pending === 'email'}
          disabled={pending !== null}
          onPress={() => continueWith('email')}
        />
        <View style={styles.crossLink}>
          <AppText tone="muted">{copy.login.noAccount} </AppText>
          <AppText variant="label" tone="primary" onPress={() => router.replace('/register')}>
            {copy.login.signUp}
          </AppText>
        </View>
        <AppText variant="caption" tone="muted" style={styles.center}>
          {copy.login.disclosure}
        </AppText>
        <AppText variant="caption" tone="muted" style={styles.legal}>
          {copy.login.legalPrefix}
          <AppText variant="caption" tone="primary" onPress={() => router.push('/terms')}>
            {copy.profile.terms}
          </AppText>
          {copy.login.legalAnd}
          <AppText variant="caption" tone="primary" onPress={() => router.push('/privacy')}>
            {copy.profile.privacy}
          </AppText>
          .
        </AppText>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 0, paddingVertical: 0, gap: 0 },
  banner: {
    backgroundColor: colors.coral,
    overflow: 'hidden',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxxl,
    gap: spacing.lg,
  },
  bannerCopy: { alignItems: 'center', gap: spacing.sm },
  center: { textAlign: 'center' },
  form: { padding: spacing.lg, gap: spacing.md },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginVertical: spacing.xs,
  },
  dividerLine: { flex: 1, height: StyleSheet.hairlineWidth },
  crossLink: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap' },
  legal: { marginTop: spacing.xs, textAlign: 'center' },
});
