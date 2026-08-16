import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { usePlanData } from '@/app-state/app-provider';
import {
  AppHeader,
  AppText,
  BottomSheet,
  Card,
  LoadingMabel,
  MabelInsight,
  Screen,
  SecondaryButton,
} from '@/components';
import { copy, formatGbp } from '@/copy';
import type { RetailerBasketItem, RetailerId } from '@/domain';
import { SEEDED_GROCERY_CATALOGUE } from '@/fixtures';
import { spacing } from '@/theme';

export default function RetailerBasketScreen() {
  const { id } = useLocalSearchParams<{ id: RetailerId }>();
  const { comparison, isLoading } = usePlanData();
  const [selected, setSelected] = useState<RetailerBasketItem | null>(null);
  const basket = comparison?.baskets.find((item) => item.retailerId === id);
  if (isLoading || !basket) {
    return (
      <Screen scroll={false} contentStyle={styles.loading}>
        <LoadingMabel label={copy.retailer.loading} />
      </Screen>
    );
  }
  const alternatives = selected
    ? SEEDED_GROCERY_CATALOGUE.filter(
        (product) =>
          product.retailerId === basket.retailerId &&
          product.ingredientId === selected.product.ingredientId &&
          product.id !== selected.product.id,
      ).slice(0, 3)
    : [];
  return (
    <Screen>
      <AppHeader
        title={copy.retailer.shopTitle(basket.retailerName)}
        onBack={() => router.back()}
      />
      <AppText variant="display">{formatGbp(basket.subtotal)}</AppText>
      {basket.unavailableIngredientIds.length ? (
        <MabelInsight title={copy.retailer.incompleteTitle}>
          {copy.retailer.incompleteBody(basket.unavailableIngredientIds.length)}
        </MabelInsight>
      ) : null}
      {basket.items.map((item) => (
        <Card key={item.product.id} style={styles.item}>
          <AppText variant="caption" tone="muted">
            {item.product.ingredientId.replaceAll('-', ' ')}
          </AppText>
          <AppText variant="bodyStrong">{item.product.name}</AppText>
          <View style={styles.row}>
            <AppText tone="muted">
              {copy.retailer.packLine(
                item.packCount,
                `${item.product.packQuantity}${item.product.packUnit}`,
                formatGbp(item.product.offer.price),
              )}
            </AppText>
            <AppText variant="bodyStrong">{formatGbp(item.lineTotal)}</AppText>
          </View>
          <SecondaryButton
            label={copy.retailer.chooseAnother}
            onPress={() => setSelected(item)}
          />
        </Card>
      ))}
      <BottomSheet
        visible={Boolean(selected)}
        title={copy.retailer.chooseAnother}
        onClose={() => setSelected(null)}
      >
        {alternatives.length ? (
          alternatives.map((product) => (
            <Card key={product.id} style={styles.item}>
              <AppText variant="bodyStrong">{product.name}</AppText>
              <AppText tone="muted">
                {copy.retailer.productMeta(
                  `${product.packQuantity}${product.packUnit}`,
                  formatGbp(product.offer.price),
                )}
              </AppText>
              <SecondaryButton
                label={copy.retailer.chooseThis}
                onPress={() => setSelected(null)}
              />
            </Card>
          ))
        ) : (
          <MabelInsight title={copy.retailer.onlyMatchTitle}>
            {copy.retailer.onlyMatchBody}
          </MabelInsight>
        )}
      </BottomSheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  loading: { justifyContent: 'center' },
  item: { gap: spacing.sm },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md },
});
