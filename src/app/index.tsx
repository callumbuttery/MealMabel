import { Redirect } from 'expo-router';

import { useMealMabelApp } from '@/app-state/app-provider';
import { LoadingMabel, Screen } from '@/components';
import { copy } from '@/copy';

export default function EntryScreen() {
  const { ready, state } = useMealMabelApp();
  if (!ready) {
    return (
      <Screen scroll={false} contentStyle={{ justifyContent: 'center' }}>
        <LoadingMabel label={copy.launch.loading} />
      </Screen>
    );
  }
  return <Redirect href={state.onboardingComplete ? '/(tabs)' : '/(onboarding)'} />;
}
