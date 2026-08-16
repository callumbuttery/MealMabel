import { StyleSheet, View } from 'react-native';

import {
  AppText,
  AppTextInput,
  Card,
  ChoiceChip,
  NumberStepper,
  SectionHeader,
} from '@/components';
import {
  formatNutritionTargets,
  resolveMemberTargets,
  typicalTargetsFor,
  type HouseholdMember,
  type NutritionTargetMode,
} from '@/domain';
import { copy } from '@/copy';
import { spacing } from '@/theme';

export function HouseholdPeopleForm({
  adults,
  childCount,
  members,
  onAdultsChange,
  onChildCountChange,
  onMembersChange,
}: {
  adults: number;
  childCount: number;
  members: HouseholdMember[];
  onAdultsChange: (adults: number) => void;
  onChildCountChange: (childCount: number) => void;
  onMembersChange: (members: HouseholdMember[]) => void;
}) {
  const updateMember = (id: string, patch: Partial<HouseholdMember>) => {
    onMembersChange(
      members.map((member) => (member.id === id ? { ...member, ...patch } : member)),
    );
  };

  return (
    <View style={styles.stack}>
      <Card style={styles.counts}>
        <View style={styles.row}>
          <AppText variant="bodyStrong">{copy.household.adults}</AppText>
          <NumberStepper
            label={copy.household.adultsStepper}
            min={1}
            max={8}
            value={adults}
            onChange={onAdultsChange}
          />
        </View>
        <View style={styles.row}>
          <AppText variant="bodyStrong">{copy.household.children}</AppText>
          <NumberStepper
            label={copy.household.childrenStepper}
            min={0}
            max={8}
            value={childCount}
            onChange={onChildCountChange}
          />
        </View>
      </Card>

      <SectionHeader
        title={copy.household.peopleTitle}
        subtitle={copy.household.peopleSubtitle}
      />
      {members.map((member) => (
        <PersonCard
          key={member.id}
          member={member}
          onChange={(patch) => updateMember(member.id, patch)}
        />
      ))}
    </View>
  );
}

function PersonCard({
  member,
  onChange,
}: {
  member: HouseholdMember;
  onChange: (patch: Partial<HouseholdMember>) => void;
}) {
  const targets = resolveMemberTargets(member);
  const typical = typicalTargetsFor(member);
  const weightValue = member.body?.weightKg ? String(member.body.weightKg) : '';

  const setMode = (nutritionMode: NutritionTargetMode) => {
    onChange({
      nutritionMode,
      customTargets:
        nutritionMode === 'custom'
          ? {
              caloriesKcal: typical.caloriesKcal,
              proteinG: typical.proteinG,
              fibreG: typical.fibreG,
              ...member.customTargets,
            }
          : member.customTargets,
    });
  };

  return (
    <Card style={styles.person}>
      <AppTextInput
        label={copy.household.name}
        value={member.displayName}
        onChangeText={(displayName) => onChange({ displayName })}
        placeholder={
          member.kind === 'adult'
            ? copy.household.adultPlaceholder
            : copy.household.childPlaceholder
        }
      />
      <View style={styles.chips}>
        <ChoiceChip
          label={copy.household.typicalDiet}
          selected={member.nutritionMode === 'typical'}
          onPress={() => setMode('typical')}
        />
        <ChoiceChip
          label={copy.household.customTargets}
          selected={member.nutritionMode === 'custom'}
          onPress={() => setMode('custom')}
        />
      </View>
      <AppTextInput
        label={copy.household.weight}
        helperText={copy.household.weightHelper}
        value={weightValue}
        placeholder={
          member.kind === 'adult'
            ? copy.household.adultWeightPlaceholder
            : copy.household.childWeightPlaceholder
        }
        keyboardType="decimal-pad"
        onChangeText={(value) =>
          onChange({
            body: {
              ...member.body,
              weightKg: parseOptionalNumber(value),
            },
          })
        }
      />
      {member.nutritionMode === 'custom' ? (
        <View style={styles.targets}>
          <AppTextInput
            label={copy.household.calories}
            value={String(member.customTargets?.caloriesKcal ?? typical.caloriesKcal)}
            keyboardType="number-pad"
            onChangeText={(value) =>
              onChange({
                customTargets: {
                  ...member.customTargets,
                  caloriesKcal: parseOptionalNumber(value),
                },
              })
            }
          />
          <AppTextInput
            label={copy.household.protein}
            helperText={copy.common.grams}
            value={String(member.customTargets?.proteinG ?? typical.proteinG)}
            keyboardType="decimal-pad"
            onChangeText={(value) =>
              onChange({
                customTargets: {
                  ...member.customTargets,
                  proteinG: parseOptionalNumber(value),
                },
              })
            }
          />
          <AppTextInput
            label={copy.household.fibre}
            helperText={copy.common.grams}
            value={String(member.customTargets?.fibreG ?? typical.fibreG)}
            keyboardType="decimal-pad"
            onChangeText={(value) =>
              onChange({
                customTargets: {
                  ...member.customTargets,
                  fibreG: parseOptionalNumber(value),
                },
              })
            }
          />
        </View>
      ) : (
        <AppText tone="muted">
          {copy.household.typicalSummary(formatNutritionTargets(targets))}
        </AppText>
      )}
    </Card>
  );
}

function parseOptionalNumber(value: string): number | undefined {
  const cleaned = value.replace(/[^0-9.]/g, '');
  if (!cleaned) {
    return undefined;
  }
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : undefined;
}

const styles = StyleSheet.create({
  stack: { gap: spacing.lg },
  counts: { gap: spacing.xl },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  person: { gap: spacing.md },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  targets: { gap: spacing.md },
});
