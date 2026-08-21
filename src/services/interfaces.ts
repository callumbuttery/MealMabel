import type {
  CompareShopResult,
  GroceryProduct,
  IngredientRequirement,
  MealSwapRequest,
  PlanModificationRequest,
  PlanRequest,
  RetailerBasket,
  RetailerComparison,
  RetailerId,
  ShoppingList,
  WeeklyPlan,
} from '@/domain/models';

export interface MealPlanningService {
  generatePlan(request: PlanRequest): Promise<WeeklyPlan>;
  swapMeal(plan: WeeklyPlan, request: MealSwapRequest): Promise<WeeklyPlan>;
  modifyPlan(plan: WeeklyPlan, request: PlanModificationRequest): Promise<WeeklyPlan>;
}

export interface ShoppingService {
  createList(plan: WeeklyPlan): Promise<ShoppingList>;
  compareRetailers(requirements: IngredientRequirement[]): Promise<RetailerComparison>;
}

export interface CompareShopService {
  compareList(input: string): Promise<CompareShopResult>;
}

export interface GroceryCatalogueService {
  getProducts(): Promise<GroceryProduct[]>;
  getProductsForIngredient(ingredientId: string): Promise<GroceryProduct[]>;
}

export interface GroceryCatalogService {
  searchProducts(query: string, retailer: RetailerId): Promise<GroceryProduct[]>;
}

export interface BasketService {
  buildBasket(plan: WeeklyPlan, retailer: RetailerId): Promise<RetailerBasket>;
  compareRetailers(plan: WeeklyPlan, retailers: RetailerId[]): Promise<RetailerComparison>;
}
