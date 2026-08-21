import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { useMealMabelApp } from '@/app-state/app-provider';
import {
  AppText,
  AppTextInput,
  Badge,
  Blob,
  IconButton,
  PrimaryButton,
  Screen,
  StickerButton,
} from '@/components';
import { copy } from '@/copy';
import type { AuthProvider } from '@/domain';
import { colors, spacing, useMealMabelTheme } from '@/theme';

export default function RegisterScreen() {
  const params = useLocalSearchParams<{ from?: string }>();
  const { state, signIn } = useMealMabelApp();
  const theme = useMealMabelTheme();
  const [name, setName] = useState('');
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
      await signIn(provider, provider === 'email' ? email : undefined, name);
      finish();
    } catch {
      setError(provider === 'email' ? copy.register.invalidEmail : copy.register.failed);
    } finally {
      setPending(null);
    }
  };

  return (
    <Screen contentStyle={styles.content}>
      <View style={styles.banner}>
        <Blob size={150} color={colors.mustard} top={-45} left={-45} opacity={0.85} />
        <Blob size={130} color={colors.sageDark} bottom={-55} right={-35} opacity={0.5} />
        <IconButton icon="arrow-back" label={copy.a11y.back} onPress={() => router.back()} />
        <View style={styles.bannerCopy}>
          <Badge label={copy.register.badge} />
          <AppText variant="h1" tone="inverse">
            {copy.register.title}
          </AppText>
          <AppText variant="bodyStrong" tone="inverse">
            {copy.register.subtitle}
          </AppText>
        </View>
      </View>
      <View style={styles.form}>
        <StickerButton
          label={copy.register.google}
          icon="logo-google"
          backgroundColor={colors.white}
          textColor={colors.cocoa}
          loading={pending === 'google'}
          disabled={pending !== null}
          onPress={() => continueWith('google')}
        />
        <StickerButton
          label={copy.register.apple}
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
            {copy.register.or}
          </AppText>
          <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
        </View>
        <AppTextInput
          label={copy.register.nameLabel}
          placeholder={copy.register.namePlaceholder}
          value={name}
          onChangeText={setName}
          autoComplete="name"
        />
        <AppTextInput
          label={copy.register.emailLabel}
          placeholder={copy.register.emailPlaceholder}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          error={error}
        />
        <AppTextInput
          label={copy.register.passwordLabel}
          placeholder={copy.register.passwordPlaceholder}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="password-new"
        />
        <PrimaryButton
          label={copy.register.cta}
          loading={pending === 'email'}
          disabled={pending !== null}
          onPress={() => continueWith('email')}
        />
        <View style={styles.crossLink}>
          <AppText tone="muted">{copy.register.haveAccount} </AppText>
          <AppText variant="label" tone="primary" onPress={() => router.replace('/login')}>
            {copy.register.logIn}
          </AppText>
        </View>
        <AppText variant="caption" tone="muted" style={styles.center}>
          {copy.register.disclosure}
        </AppText>
        <AppText variant="caption" tone="muted" style={styles.legal}>
          {copy.register.legalPrefix}
          <AppText variant="caption" tone="primary" onPress={() => router.push('/terms')}>
            {copy.profile.terms}
          </AppText>
          {copy.register.legalAnd}
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
    backgroundColor: colors.sage,
    overflow: 'hidden',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxxl,
    gap: spacing.md,
  },
  bannerCopy: { gap: spacing.xs },
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
