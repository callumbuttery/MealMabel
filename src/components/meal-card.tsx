import Ionicons from '@expo/vector-icons/Ionicons';
import { Image, Pressable, StyleSheet, View, type ImageSourcePropType } from 'react-native';

import { AppText } from '@/components/app-text';
import { Card } from '@/components/card';
import type { IconName } from '@/components/icon-name';
import { sharedStyles } from '@/components/shared-styles';
import { copy } from '@/copy';
import { colors, radii, spacing, useMealMabelTheme } from '@/theme';

const MEAL_TYPE_TINTS = {
  breakfast: colors.peach,
  lunch: colors.sageSoft,
  dinner: colors.sageSoft,
} as const;

export type MealCardProps = {
  title: string;
  image?: ImageSourcePropType;
  time?: string;
  cost?: string;
  servings?: number;
  selected?: boolean;
  onPress?: () => void;
  badge?: string;
  note?: string;
  mealType?: keyof typeof MEAL_TYPE_TINTS;
};

export function MealCard({
  title,
  image,
  time,
  cost,
  servings,
  selected = false,
  onPress,
  badge,
  note,
  mealType,
}: MealCardProps) {
  const theme = useMealMabelTheme();
  const placeholderTint = mealType ? MEAL_TYPE_TINTS[mealType] : theme.surfaceMuted;
  const card = (
    <Card
      elevated
      accessibilityLabel={[title, time, cost, servings ? `${servings} servings` : undefined, note]
        .filter(Boolean)
        .join(', ')}
      style={[styles.mealCard, selected && { borderColor: theme.accent, borderWidth: 2 }]}
    >
      <View style={[styles.mealImage, { backgroundColor: placeholderTint }]}>
        {image ? (
          <Image source={image} style={sharedStyles.fill} resizeMode="cover" />
        ) : (
          <View
            accessible
            accessibilityLabel={copy.a11y.mealImagePlaceholder}
            style={styles.mealImagePlaceholder}
          >
            <AppText variant="caption" tone="muted">
              {copy.components.mealPhotoPlaceholder}
            </AppText>
          </View>
        )}
        {badge ? (
          <View style={[styles.mealBadge, { backgroundColor: theme.primary }]}>
            <AppText variant="caption" tone="inverse">
              {badge}
            </AppText>
          </View>
        ) : null}
        {selected ? (
          <View style={[styles.selectedBadge, { backgroundColor: theme.accent }]}>
            <Ionicons name="checkmark" size={18} color={theme.primaryContrast} />
          </View>
        ) : null}
      </View>
      <View style={styles.mealCopy}>
        <AppText variant="h3" numberOfLines={2}>
          {title}
        </AppText>
        <View style={styles.metaRow}>
          {time ? <Meta icon="time-outline" text={time} /> : null}
          {servings ? <Meta icon="people-outline" text={String(servings)} /> : null}
          {cost ? <Meta icon="wallet-outline" text={cost} /> : null}
        </View>
        {note ? (
          <AppText variant="caption" tone="muted">
            {note}
          </AppText>
        ) : null}
      </View>
    </Card>
  );

  return onPress ? (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`View ${title}`}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => pressed && sharedStyles.pressed}
    >
      {card}
    </Pressable>
  ) : (
    card
  );
}

function Meta({ icon, text }: { icon: IconName; text: string }) {
  const theme = useMealMabelTheme();
  return (
    <View style={styles.meta}>
      <Ionicons name={icon} size={16} color={theme.textMuted} />
      <AppText variant="caption" tone="muted">
        {text}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  mealCard: { padding: 0, overflow: 'hidden' },
  mealImage: { height: 180, alignItems: 'center', justifyContent: 'center' },
  mealImagePlaceholder: {
    backgroundColor: 'rgba(255,255,255,0.75)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.xs,
  },
  mealCopy: { padding: spacing.lg, gap: spacing.md },
  mealBadge: {
    position: 'absolute',
    left: spacing.md,
    top: spacing.md,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  selectedBadge: {
    position: 'absolute',
    right: spacing.md,
    top: spacing.md,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  meta: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
});
