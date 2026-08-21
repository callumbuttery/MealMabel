import { StyleSheet, View } from 'react-native';

import { AppText, ChoiceChip, SectionHeader } from '@/components';
import { copy } from '@/copy';
import { dietMeetsHouseholdDiet, type DietType } from '@/domain';
import { spacing } from '@/theme';

const DIETS = Object.keys(copy.diets) as DietType[];

export function DietChips({
  value,
  onChange,
  title = copy.dietsHeading,
  subtitle,
  requiredDiet = 'anything',
  compact = false,
}: {
  value: DietType;
  onChange: (diet: DietType) => void;
  title?: string;
  subtitle?: string;
  requiredDiet?: DietType;
  compact?: boolean;
}) {
  const chips = (
    <View style={styles.chips}>
      {DIETS.map((diet) => (
        <ChoiceChip
          key={diet}
          label={copy.diets[diet]}
          selected={value === diet}
          disabled={!dietMeetsHouseholdDiet(diet, requiredDiet)}
          onPress={() => onChange(diet)}
        />
      ))}
    </View>
  );

  if (compact) {
    return (
      <View style={styles.compact}>
        <AppText variant="label">{title}</AppText>
        {subtitle ? (
          <AppText variant="caption" tone="muted">
            {subtitle}
          </AppText>
        ) : null}
        {chips}
      </View>
    );
  }

  return (
    <View style={styles.stack}>
      <SectionHeader title={title} subtitle={subtitle} />
      {chips}
    </View>
  );
}

const styles = StyleSheet.create({
  stack: { gap: spacing.sm },
  compact: { gap: spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
