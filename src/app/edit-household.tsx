import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet } from 'react-native';

import { useMealMabelApp } from '@/app-state/app-provider';
import { AppHeader, AppText, PrimaryButton, Screen } from '@/components';
import { syncHouseholdMembers } from '@/domain';
import { HouseholdPeopleForm } from '@/features/household/household-people-form';
import { copy } from '@/copy';
import { spacing } from '@/theme';

export default function EditHouseholdScreen() {
  const { onboardingDraft, setOnboardingDraft, saveHouseholdFromDraft } = useMealMabelApp();
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    await saveHouseholdFromDraft();
    router.back();
  };

  return (
    <Screen contentStyle={styles.content}>
      <AppHeader title={copy.editHousehold.title} onBack={() => router.back()} />
      <AppText tone="muted">{copy.editHousehold.intro}</AppText>
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
      <PrimaryButton label={copy.editHousehold.save} loading={saving} onPress={save} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.xl },
});
