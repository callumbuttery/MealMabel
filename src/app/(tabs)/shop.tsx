import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { useMealMabelApp, usePlanData } from '@/app-state/app-provider';
import {
  AppText,
  ChoiceChip,
  EmptyState,
  LoadingMabel,
  MabelInsight,
  RetailerCard,
  Screen,
  ShoppingCategory,
  ShoppingListItemRow,
} from '@/components';
import { copy, formatGbp, shoppingCategoryFor } from '@/copy';
import type { ShoppingListItem } from '@/domain';
import { spacing } from '@/theme';

type ViewMode = 'list' | 'compare';

export default function ShopScreen() {
  const { state, toggleShoppingItem } = useMealMabelApp();
  const { shoppingList, comparison, isLoading } = usePlanData();
  const [mode, setMode] = useState<ViewMode>('list');
  if (!state.currentPlan) {
    return (
      <Screen>
        <AppText variant="h1">{copy.shop.title}</AppText>
        <EmptyState
          title={copy.shop.emptyTitle}
          message={copy.shop.emptyBody}
          actionLabel={copy.shop.emptyCta}
          onAction={() => router.push('/create-plan')}
        />
      </Screen>
    );
  }
  if (isLoading || !shoppingList || !comparison) {
    return (
      <Screen scroll={false} contentStyle={styles.loading}>
        <LoadingMabel label={copy.shop.loading} />
      </Screen>
    );
  }
  const complete = shoppingList.items.filter((item) =>
    state.checkedShoppingItemIds.includes(item.ingredientId),
  ).length;
  const best = comparison.baskets.find(
    (basket) => basket.retailerId === comparison.cheapestRetailerId,
  );
  const groups = shoppingList.items.reduce<Record<string, ShoppingListItem[]>>(
    (result, item) => {
      const category = copy.shop.categories[shoppingCategoryFor(item.ingredientId)];
      result[category] = [...(result[category] ?? []), item];
      return result;
    },
    {},
  );

  return (
    <Screen>
      <AppText variant="h1">{copy.shop.yourShop}</AppText>
      <AppText tone="muted">
        {copy.shop.summary(
          shoppingList.items.length,
          complete,
          best ? formatGbp(best.subtotal) : undefined,
        )}
      </AppText>
      <View style={styles.switcher}>
        <ChoiceChip
          label={copy.shop.listTab}
          selected={mode === 'list'}
          onPress={() => setMode('list')}
        />
        <ChoiceChip
          label={copy.shop.compareTab}
          selected={mode === 'compare'}
          onPress={() => setMode('compare')}
        />
      </View>
      {mode === 'list' ? (
        Object.entries(groups).map(([category, items]) => (
          <ShoppingCategory key={category} title={category} count={items.length}>
            {items.map((item) => (
              <ShoppingListItemRow
                key={item.ingredientId}
                name={item.name}
                quantity={copy.shop.needed(item.quantity, item.unit)}
                checked={state.checkedShoppingItemIds.includes(item.ingredientId)}
                onToggle={() => toggleShoppingItem(item.ingredientId)}
              />
            ))}
          </ShoppingCategory>
        ))
      ) : (
        <View style={styles.comparison}>
          {best ? (
            <MabelInsight
              badgeLabel={copy.shop.bestValueBadge}
              title={copy.shop.bestValueTitle(best.retailerName)}
            >
              {copy.shop.bestValueBody(
                best.retailerName,
                formatGbp(comparison.savingsAgainstMostExpensive),
              )}
            </MabelInsight>
          ) : null}
          {[...comparison.baskets]
            .sort((a, b) => a.subtotal - b.subtotal)
            .map((basket) => (
              <RetailerCard
                key={basket.retailerId}
                name={basket.retailerName}
                price={formatGbp(basket.subtotal)}
                itemCount={basket.items.length}
                bestValue={basket.retailerId === comparison.cheapestRetailerId}
                onPress={() =>
                  router.push({ pathname: '/retailer/[id]', params: { id: basket.retailerId } })
                }
              />
            ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  loading: { justifyContent: 'center' },
  switcher: { flexDirection: 'row', gap: spacing.sm },
  comparison: { gap: spacing.md },
});
