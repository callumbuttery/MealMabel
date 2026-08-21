import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { useMealMabelApp } from '@/app-state/app-provider';
import { AppText, Card, ChoiceChip, Screen, SecondaryButton, SectionHeader } from '@/components';
import { copy, formatAllergenList } from '@/copy';
import { formatNutritionTargets, householdAllergens, resolveMemberTargets } from '@/domain';
import { spacing } from '@/theme';

export default function ProfileScreen() {
  const { state, onboardingDraft, clearApp } = useMealMabelApp();
  const preferences = state.profile?.preferences;
  const notedAllergens = householdAllergens(onboardingDraft.members);
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
                {member.allergens && member.allergens.length > 0
                  ? copy.household.memberSummaryWithDietAndAllergens(
                      copy.diets[member.dietType ?? 'anything'],
                      formatAllergenList(member.allergens),
                      mode,
                      formatNutritionTargets(targets),
                    )
                  : copy.household.memberSummaryWithDiet(
                      copy.diets[member.dietType ?? 'anything'],
                      mode,
                      formatNutritionTargets(targets),
                    )}
              </AppText>
            </View>
          );
        })}
      </Card>
      <SectionHeader
        title={copy.profile.dietGoals}
        actionLabel={copy.common.edit}
        onAction={() => router.push('/edit-preferences')}
      />
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
      {preferences?.dietaryRestrictions && preferences.dietaryRestrictions.length > 0 ? (
        <>
          <SectionHeader title={copy.profile.restrictions} />
          <View style={styles.chips}>
            {preferences.dietaryRestrictions.map((restriction) => (
              <ChoiceChip
                key={restriction}
                label={copy.restrictions[restriction]}
                selected
                onPress={() => undefined}
              />
            ))}
          </View>
        </>
      ) : null}
      <SectionHeader title={copy.profile.allergens} />
      <Card>
        <AppText>
          {notedAllergens.length > 0
            ? formatAllergenList(notedAllergens)
            : copy.household.noAllergens}
        </AppText>
      </Card>
      <SectionHeader title={copy.profile.dislikes} />
      <Card>
        <AppText>{preferences?.excludedIngredients.join(', ') || copy.common.noneAdded}</AppText>
      </Card>
      <SectionHeader
        title={copy.profile.supermarkets}
        actionLabel={copy.common.edit}
        onAction={() => router.push('/edit-preferences')}
      />
      <AppText tone="muted">
        {(preferences?.preferredRetailers ?? [])
          .map((retailer) => copy.retailers[retailer])
          .join(' · ') || copy.common.noneAdded}
      </AppText>
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
