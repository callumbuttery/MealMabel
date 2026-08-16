import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { useMealMabelApp } from '@/app-state/app-provider';
import {
  AppText,
  Card,
  ChoiceChip,
  Screen,
  SecondaryButton,
  SectionHeader,
} from '@/components';
import { copy } from '@/copy';
import { formatNutritionTargets, resolveMemberTargets } from '@/domain';
import { spacing } from '@/theme';

export default function ProfileScreen() {
  const { state, onboardingDraft, clearApp } = useMealMabelApp();
  const preferences = state.profile?.preferences;
  return (
    <Screen>
      <AppText variant="h1">{copy.profile.title}</AppText>
      <SectionHeader
        title={copy.profile.household}
        actionLabel={copy.common.edit}
        onAction={() => router.push('/edit-household')}
      />
      <Card>
        {onboardingDraft.members.map((member) => {
          const targets = resolveMemberTargets(member);
          const mode =
            member.nutritionMode === 'custom'
              ? copy.household.customShort
              : copy.household.typicalDiet;
          return (
            <View key={member.id} style={styles.person}>
              <AppText variant="bodyStrong">
                {member.body?.weightKg
                  ? copy.household.nameWithWeight(member.displayName, member.body.weightKg)
                  : member.displayName}
              </AppText>
              <AppText tone="muted">
                {copy.household.memberSummary(mode, formatNutritionTargets(targets))}
              </AppText>
            </View>
          );
        })}
      </Card>
      <SectionHeader title={copy.profile.dietGoals} />
      <View style={styles.chips}>
        <ChoiceChip
          label={copy.diets[preferences?.dietType ?? 'anything']}
          selected
          onPress={() => undefined}
        />
        {(preferences?.nutritionGoals ?? []).map((goal) => (
          <ChoiceChip key={goal} label={copy.goals[goal]} selected onPress={() => undefined} />
        ))}
      </View>
      <SectionHeader title={copy.profile.dislikes} />
      <Card>
        <AppText>
          {preferences?.excludedIngredients.join(', ') || copy.common.noneAdded}
        </AppText>
      </Card>
      <SectionHeader title={copy.profile.supermarkets} />
      <AppText tone="muted">{copy.profile.supermarketList}</AppText>
      <SectionHeader title={copy.profile.account} />
      <Card>
        <AppText>{copy.profile.accountBody}</AppText>
      </Card>
      <SectionHeader title={copy.profile.about} />
      <Card>
        <Row label={copy.profile.privacy} value={copy.common.view} />
        <Row label={copy.profile.terms} value={copy.common.view} />
        <Row label={copy.profile.version} value={copy.profile.versionValue} />
      </Card>
      <SecondaryButton
        label={copy.profile.reset}
        onPress={async () => {
          await clearApp();
          router.replace('/');
        }}
      />
    </Screen>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <AppText variant="bodyStrong">{label}</AppText>
      <AppText tone="muted">{value}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm },
  person: { gap: spacing.xxs, paddingVertical: spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
