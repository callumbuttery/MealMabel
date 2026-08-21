import { StyleSheet, View } from 'react-native';

import { AppText, ChoiceChip, SectionHeader } from '@/components';
import { copy } from '@/copy';
import { ALLERGEN_IDS, toggleAllergen, type AllergenId } from '@/domain';
import { spacing } from '@/theme';

export function AllergenChips({
  value,
  onChange,
  title = copy.household.allergens,
  subtitle,
  compact = false,
}: {
  value: readonly AllergenId[];
  onChange: (allergens: AllergenId[]) => void;
  title?: string;
  subtitle?: string;
  compact?: boolean;
}) {
  const chips = (
    <View style={styles.chips}>
      {ALLERGEN_IDS.map((allergen) => (
        <ChoiceChip
          key={allergen}
          label={copy.allergens[allergen]}
          selected={value.includes(allergen)}
          onPress={() => onChange(toggleAllergen(value, allergen))}
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
