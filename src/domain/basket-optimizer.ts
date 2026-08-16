import type {
  GroceryProduct,
  IngredientRequirement,
  IngredientUnit,
  RetailerBasket,
  RetailerBasketItem,
  RetailerComparison,
  RetailerId,
} from '@/domain/models';

const RETAILER_NAMES: Record<RetailerId, string> = {
  tesco: 'Tesco',
  asda: 'Asda',
  sainsburys: "Sainsbury's",
};

function toBaseQuantity(quantity: number, unit: IngredientUnit): {
  quantity: number;
  unit: IngredientUnit;
} {
  if (unit === 'kg') {
    return { quantity: quantity * 1000, unit: 'g' };
  }
  if (unit === 'l') {
    return { quantity: quantity * 1000, unit: 'ml' };
  }
  return { quantity, unit };
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

export function optimiseBasketItem(
  requirement: IngredientRequirement,
  products: GroceryProduct[],
): RetailerBasketItem | null {
  const required = toBaseQuantity(requirement.quantity, requirement.unit);
  const candidates = products
    .filter((product) => product.ingredientId === requirement.ingredientId)
    .map((product): RetailerBasketItem | null => {
      const pack = toBaseQuantity(product.packQuantity, product.packUnit);
      if (pack.unit !== required.unit || pack.quantity <= 0) {
        return null;
      }

      const packCount = Math.ceil(required.quantity / pack.quantity);
      return {
        product,
        requiredQuantity: required.quantity,
        requiredUnit: required.unit,
        packCount,
        suppliedQuantity: packCount * pack.quantity,
        lineTotal: roundMoney(packCount * product.offer.price),
      };
    })
    .filter((item): item is RetailerBasketItem => item !== null);

  return (
    candidates.sort(
      (left, right) =>
        left.lineTotal - right.lineTotal ||
        left.suppliedQuantity - right.suppliedQuantity,
    )[0] ?? null
  );
}

export function buildRetailerBasket(
  retailerId: RetailerId,
  requirements: IngredientRequirement[],
  catalogue: GroceryProduct[],
): RetailerBasket {
  const products = catalogue.filter((product) => product.retailerId === retailerId);
  const items: RetailerBasketItem[] = [];
  const unavailableIngredientIds: string[] = [];

  for (const requirement of requirements) {
    const item = optimiseBasketItem(requirement, products);
    if (item) {
      items.push(item);
    } else {
      unavailableIngredientIds.push(requirement.ingredientId);
    }
  }

  return {
    retailerId,
    retailerName: RETAILER_NAMES[retailerId],
    items,
    subtotal: roundMoney(items.reduce((total, item) => total + item.lineTotal, 0)),
    currency: 'GBP',
    unavailableIngredientIds,
  };
}

export function compareRetailers(
  requirements: IngredientRequirement[],
  catalogue: GroceryProduct[],
  retailerIds: RetailerId[] = ['tesco', 'asda', 'sainsburys'],
): RetailerComparison {
  const baskets = retailerIds.map((retailerId) =>
    buildRetailerBasket(retailerId, requirements, catalogue),
  );
  const complete = baskets.filter(
    (basket) => basket.unavailableIngredientIds.length === 0,
  );
  const ordered = [...complete].sort((left, right) => left.subtotal - right.subtotal);

  return {
    baskets,
    cheapestRetailerId: ordered[0]?.retailerId ?? null,
    savingsAgainstMostExpensive:
      ordered.length > 1
        ? roundMoney(ordered[ordered.length - 1].subtotal - ordered[0].subtotal)
        : 0,
    currency: 'GBP',
  };
}
