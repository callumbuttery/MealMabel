import { router } from 'expo-router';
import { StyleSheet } from 'react-native';

import { AppHeader, AppText, Screen } from '@/components';
import { copy } from '@/copy';
import { spacing } from '@/theme';

export default function TermsScreen() {
  return (
    <Screen>
      <AppHeader title={copy.legal.termsTitle} onBack={() => router.back()} />
      {copy.legal.termsBody.map((paragraph) => (
        <AppText key={paragraph} tone="muted" style={styles.paragraph}>
          {paragraph}
        </AppText>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  paragraph: { marginBottom: spacing.md },
});
