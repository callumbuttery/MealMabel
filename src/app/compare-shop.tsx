import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import {
  AppHeader,
  AppText,
  AppTextInput,
  LoadingMabel,
  MabelInsight,
  PriceComparisonCard,
  PrimaryButton,
  RetailerCard,
  Screen,
  SecondaryButton,
  SectionHeader,
} from '@/components';
import { analytics } from '@/analytics';
import { copy, formatGbp } from '@/copy';
import type { CompareShopResult } from '@/domain';
import { MockCompareShopService, type CompareShopService } from '@/services';
import { spacing } from '@/theme';

const comparer: CompareShopService = new MockCompareShopService({
  delayMs: 650,
});

export default function CompareShopScreen() {
  const [list, setList] = useState('');
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CompareShopResult>();

  const compare = async () => {
    if (!list.trim()) {
      setError(copy.compareShop.emptyError);
      return;
    }
    setLoading(true);
    setError(undefined);
    try {
      const next = await comparer.compareList(list);
      if (next.matchedItems.length === 0) {
        setError(copy.compareShop.noMatches);
      } else {
        setResult(next);
        void analytics.track('retailer_compared', {
          source: 'compare-shop',
          matchedItems: next.matchedItems.length,
          unmatchedItems: next.unmatchedLines.length,
          cheapestRetailerId: next.comparison.cheapestRetailerId,
        });
      }
    } catch {
      setError(copy.compareShop.noMatches);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Screen scroll={false} contentStyle={styles.loading}>
        <LoadingMabel label={copy.compareShop.loading} />
      </Screen>
    );
  }

  if (result) {
    const best = result.comparison.baskets.find(
      (basket) => basket.retailerId === result.comparison.cheapestRetailerId,
    );
    return (
      <Screen>
        <AppHeader
          title={copy.compareShop.resultsTitle}
          subtitle={copy.compareShop.matchedSummary(
            result.matchedItems.length,
            result.unmatchedLines.length,
          )}
          onBack={() => router.back()}
        />
        {best ? (
          <MabelInsight
            badgeLabel={copy.compareShop.bestBadge}
            title={copy.compareShop.bestTitle(best.retailerName)}
          >
            {copy.compareShop.bestBody(
              formatGbp(best.subtotal),
              formatGbp(result.comparison.savingsAgainstMostExpensive),
            )}
          </MabelInsight>
        ) : null}

        <SectionHeader title={copy.compareShop.retailersTitle} />
        <View style={styles.results}>
          {[...result.comparison.baskets]
            .sort((left, right) => left.subtotal - right.subtotal)
            .map((basket) => (
              <RetailerCard
                key={basket.retailerId}
                name={basket.retailerName}
                price={formatGbp(basket.subtotal)}
                itemCount={basket.items.length}
                bestValue={basket.retailerId === result.comparison.cheapestRetailerId}
              />
            ))}
        </View>

        <SectionHeader
          title={copy.compareShop.individualTitle}
          subtitle={copy.compareShop.individualBody}
        />
        <View style={styles.results}>
          {result.matchedItems.map((matched) => {
            const basketItems = result.comparison.baskets.flatMap((basket) => {
              const item = basket.items.find(
                (candidate) => candidate.product.ingredientId === matched.ingredientId,
              );
              return item ? [{ basket, item }] : [];
            });
            const cheapest = Math.min(...basketItems.map(({ item }) => item.lineTotal));
            return (
              <PriceComparisonCard
                key={matched.ingredientId}
                itemName={matched.name}
                offers={basketItems.map(({ basket, item }) => ({
                  retailer: basket.retailerName,
                  price: formatGbp(item.lineTotal),
                  detail: copy.compareShop.packDetail(
                    item.packCount,
                    `${item.product.packQuantity}${item.product.packUnit}`,
                  ),
                  best: item.lineTotal === cheapest,
                }))}
              />
            );
          })}
        </View>

        {result.unmatchedLines.length > 0 ? (
          <MabelInsight title={copy.compareShop.unmatchedTitle}>
            {copy.compareShop.unmatchedBody(result.unmatchedLines.join(', '))}
          </MabelInsight>
        ) : null}
        <SecondaryButton label={copy.compareShop.editList} onPress={() => setResult(undefined)} />
      </Screen>
    );
  }

  return (
    <Screen>
      <AppHeader title={copy.compareShop.title} onBack={() => router.back()} />
      <MabelInsight title={copy.compareShop.introTitle}>{copy.compareShop.introBody}</MabelInsight>
      <AppTextInput
        label={copy.compareShop.listLabel}
        placeholder={copy.compareShop.listPlaceholder}
        value={list}
        onChangeText={(value) => {
          setList(value);
          setError(undefined);
        }}
        error={error}
        multiline
        autoCapitalize="sentences"
        autoCorrect
        style={styles.input}
      />
      <PrimaryButton
        label={copy.compareShop.compareCta}
        disabled={!list.trim()}
        onPress={() => void compare()}
      />
      <AppText variant="caption" tone="muted">
        {copy.compareShop.individualBody}
      </AppText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  loading: { justifyContent: 'center' },
  input: { minHeight: 190, textAlignVertical: 'top' },
  results: { gap: spacing.md },
});
