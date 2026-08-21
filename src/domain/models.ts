export type ISODate = string;
export type CurrencyCode = 'GBP';
export type MealType = 'breakfast' | 'lunch' | 'dinner';
export type RetailerId = 'tesco' | 'asda' | 'sainsburys';
export type DietType = 'anything' | 'vegetarian' | 'vegan' | 'pescatarian';
export type NutritionGoal =
  | 'high_protein'
  | 'lower_calorie'
  | 'high_fibre'
  | 'five_a_day'
  | 'cheapest_possible';
export type DietaryRestriction = 'nut_free' | 'dairy_free' | 'gluten_free' | 'egg_free';
export type CookingEffort = 'easy' | 'normal' | 'enthusiastic';
export type HouseholdMemberKind = 'adult' | 'child';
export type NutritionTargetMode = 'typical' | 'custom';
export type IngredientUnit = 'g' | 'kg' | 'ml' | 'l' | 'each' | 'tbsp' | 'tsp';
export type DietaryPreference =
  | 'none'
  | 'vegetarian'
  | 'vegan'
  | 'pescatarian'
  | 'gluten-free'
  | 'dairy-free';

export interface UserProfile {
  id: string;
  name: string;
  householdId: string;
  household?: Household;
  preferences: UserPreferences;
  createdAt: ISODate;
  updatedAt: ISODate;
}

export interface Household {
  id: string;
  name: string;
  memberCount: number;
  adultCount: number;
  childCount: number;
  members: HouseholdMember[];
}

export interface HouseholdMember {
  id: string;
  displayName: string;
  kind: HouseholdMemberKind;
  nutritionMode: NutritionTargetMode;
  body?: PersonBodyStats;
  customTargets?: Partial<DailyNutritionTargets>;
}

export interface PersonBodyStats {
  weightKg?: number;
  heightCm?: number;
  ageYears?: number;
}

export interface DailyNutritionTargets {
  caloriesKcal: number;
  proteinG: number;
  fibreG: number;
}

export interface UserPreferences {
  dietaryPreferences: DietaryPreference[];
  dietType?: DietType;
  nutritionGoals?: NutritionGoal[];
  dietaryRestrictions?: DietaryRestriction[];
  cookingEffort?: CookingEffort;
  excludedIngredients: string[];
  allergens: string[];
  dailyCalorieTarget: number;
  dailyProteinTargetG: number;
  dailyFibreTargetG?: number;
  maximumWeeklyBudget: number;
  preferredRetailers: RetailerId[];
  cookingTimeLimitMinutes: number;
}

export interface PlanRequest {
  household: Household;
  preferences: UserPreferences;
  weekStarting: ISODate;
  mealsPerDay: MealType[];
  durationDays?: 3 | 5 | 7;
}

export interface WeeklyPlan {
  id: string;
  weekStarting: ISODate;
  days: PlanDay[];
  householdServings: number;
  nutrition: NutritionSummary;
  generatedAt: ISODate;
}

export interface PlanDay {
  date: ISODate;
  dayName: string;
  meals: Meal[];
  nutrition: NutritionSummary;
}

export interface Meal {
  id: string;
  type: MealType;
  recipe: Recipe;
  servings: number;
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  mealTypes: MealType[];
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  servings: number;
  ingredients: RecipeIngredient[];
  instructions: string[];
  nutritionPerServing: NutritionSummary;
  tags: string[];
  allergens: string[];
}

export interface RecipeIngredient {
  ingredientId: string;
  name: string;
  quantity: number;
  unit: IngredientUnit;
  optional?: boolean;
}

export interface NutritionSummary {
  caloriesKcal: number;
  proteinG: number;
  carbohydratesG: number;
  fatG: number;
  fibreG: number;
}

export interface IngredientRequirement {
  ingredientId: string;
  name: string;
  quantity: number;
  unit: IngredientUnit;
}

export interface ShoppingList {
  id: string;
  planId: string;
  items: ShoppingListItem[];
  createdAt: ISODate;
}

export interface ShoppingListItem extends IngredientRequirement {
  checked: boolean;
}

export interface GroceryProduct {
  id: string;
  retailerId: RetailerId;
  name: string;
  ingredientId: string;
  packQuantity: number;
  packUnit: IngredientUnit;
  nutrition?: ProductNutrition;
  offer: ProductOffer;
}

export interface ProductNutrition {
  caloriesKcal: number;
  proteinG: number;
  carbohydratesG: number;
  fatG: number;
  fibreG: number;
  basis: '100g' | '100ml' | 'each';
}

export interface ProductOffer {
  price: number;
  currency: CurrencyCode;
  promotionDescription?: string;
}

export interface RetailerBasket {
  retailerId: RetailerId;
  retailerName: string;
  items: RetailerBasketItem[];
  subtotal: number;
  currency: CurrencyCode;
  unavailableIngredientIds: string[];
}

export interface RetailerBasketItem {
  product: GroceryProduct;
  requiredQuantity: number;
  requiredUnit: IngredientUnit;
  packCount: number;
  suppliedQuantity: number;
  lineTotal: number;
}

export type ProductSelectionOverrides = Record<string, string>;

export interface RetailerComparison {
  baskets: RetailerBasket[];
  cheapestRetailerId: RetailerId | null;
  savingsAgainstMostExpensive: number;
  currency: CurrencyCode;
}

export interface CompareShopMatchedItem extends IngredientRequirement {
  inputLines: string[];
}

export interface CompareShopResult {
  matchedItems: CompareShopMatchedItem[];
  unmatchedLines: string[];
  comparison: RetailerComparison;
}

export interface MealSwapRequest {
  planId: string;
  date: ISODate;
  mealId: string;
  replacementRecipeId?: string;
  reason?: string;
}

export type PlanModification =
  | { type: 'remove-meal'; date: ISODate; mealId: string }
  | { type: 'change-servings'; date: ISODate; mealId: string; servings: number }
  | { type: 'swap-meal'; request: MealSwapRequest };

export interface PlanModificationRequest {
  planId: string;
  modifications: PlanModification[];
}
