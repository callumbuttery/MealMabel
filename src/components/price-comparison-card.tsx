import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { Card } from '@/components/card';
import { RetailerLogo } from '@/components/retailer-logo';
import { sharedStyles } from '@/components/shared-styles';
import { spacing, useMealMabelTheme } from '@/theme';

export type PriceOffer = {
  retailer: string;
  price: string;
  detail?: string;
  best?: boolean;
};

export type PriceComparisonCardProps = {
  itemName: string;
  offers: PriceOffer[];
};

export function PriceComparisonCard({ itemName, offers }: PriceComparisonCardProps) {
  const theme = useMealMabelTheme();
  return (
    <Card style={styles.comparisonCard}>
      <AppText variant="h3">{itemName}</AppText>
      {offers.map((offer, index) => (
        <View
          key={`${offer.retailer}-${index}`}
          style={[
            styles.offerRow,
            index > 0 && {
              borderTopColor: theme.border,
              borderTopWidth: StyleSheet.hairlineWidth,
            },
          ]}
        >
          <RetailerLogo name={offer.retailer} size={36} />
          <View style={sharedStyles.flex}>
            <AppText variant="label">{offer.retailer}</AppText>
            {offer.detail ? (
              <AppText variant="caption" tone="muted">
                {offer.detail}
              </AppText>
            ) : null}
          </View>
          {offer.best ? <Ionicons name="checkmark-circle" size={20} color={theme.accent} /> : null}
          <AppText variant="bodyStrong">{offer.price}</AppText>
        </View>
      ))}
    </Card>
  );
}

const styles = StyleSheet.create({
  comparisonCard: { gap: spacing.sm },
  offerRow: {
    minHeight: 60,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
});
