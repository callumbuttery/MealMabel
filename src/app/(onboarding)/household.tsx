import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { useMealMabelApp } from '@/app-state/app-provider';
import { AppHeader, AppText, PrimaryButton, Screen } from '@/components';
import { syncHouseholdMembers } from '@/domain';
import { HouseholdPeopleForm } from '@/features/household/household-people-form';
import { copy } from '@/copy';
import { spacing } from '@/theme';

export default function HouseholdScreen() {
  const { onboardingDraft, setOnboardingDraft } = useMealMabelApp();

  return (
    <Screen contentStyle={styles.content}>
      <View>
        <AppHeader title={copy.household.title} onBack={() => router.back()} />
        <AppText tone="muted">{copy.household.intro}</AppText>
      </View>
      <HouseholdPeopleForm
        adults={onboardingDraft.adults}
        childCount={onboardingDraft.children}
        members={onboardingDraft.members}
        onAdultsChange={(adults) =>
          setOnboardingDraft({
            ...onboardingDraft,
            adults,
            members: syncHouseholdMembers(adults, onboardingDraft.children, onboardingDraft.members),
          })
        }
        onChildCountChange={(childCount) =>
          setOnboardingDraft({
            ...onboardingDraft,
            children: childCount,
            members: syncHouseholdMembers(onboardingDraft.adults, childCount, onboardingDraft.members),
          })
        }
        onMembersChange={(members) => setOnboardingDraft({ ...onboardingDraft, members })}
      />
      <PrimaryButton
        label={copy.common.continue}
        onPress={() => router.push('/(onboarding)/preferences')}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.xl },
});
