import { useQuery, useQueryClient } from '@tanstack/react-query';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  aggregateHouseholdTargets,
  aggregateIngredientRequirements,
  createHousehold,
  mergePreferenceAllergens,
  productSelectionKey,
  requiredHouseholdDiet,
  stricterDiet,
  syncHouseholdMembers,
} from '@/domain';
import type {
  Account,
  AuthProvider,
  DietaryRestriction,
  DietType,
  Household,
  MealSwapRequest,
  NutritionGoal,
  PlanRequest,
  RetailerComparison,
  RetailerId,
  ShoppingList,
  UserPreferences,
  UserProfile,
  WeeklyPlan,
} from '@/domain';
import { analytics } from '@/analytics';
import {
  createMockPlanModification,
  MockAuthService,
  MockGroceryCatalogueService,
  MockMealPlanningService,
  MockShoppingService,
  type MockPlanModificationDraft,
} from '@/services';
import { AppStateRepository, EMPTY_APP_STATE, type PersistedAppState } from '@/storage';

const repository = new AppStateRepository();
const planner = new MockMealPlanningService({ delayMs: 2800 });
const fastPlanner = new MockMealPlanningService({ delayMs: 450 });
const shopping = new MockShoppingService({ delayMs: 120 });
const catalogue = new MockGroceryCatalogueService({ delayMs: 100 });
const auth = new MockAuthService({ delayMs: 600 });

export interface OnboardingDraft {
  adults: number;
  children: number;
  members: ReturnType<typeof syncHouseholdMembers>;
}

export function createDefaultDraft(
  adults = 1,
  children = 0,
  members = syncHouseholdMembers(adults, children),
): OnboardingDraft {
  return {
    adults,
    children,
    members: syncHouseholdMembers(adults, children, members),
  };
}

function draftFromHousehold(
  household: Household,
  fallbackDiet: DietType = 'anything',
): OnboardingDraft {
  return createDefaultDraft(
    household.adultCount,
    household.childCount,
    household.members.map((member) => ({
      ...member,
      dietType: member.dietType ?? fallbackDiet,
    })),
  );
}

interface AppContextValue {
  ready: boolean;
  state: PersistedAppState;
  onboardingDraft: OnboardingDraft;
  setOnboardingDraft: (draft: OnboardingDraft) => void;
  completeOnboarding: (profile: UserProfile) => Promise<void>;
  saveHouseholdFromDraft: () => Promise<void>;
  updatePreferences: (updates: {
    dietType: DietType;
    nutritionGoals: NutritionGoal[];
    dietaryRestrictions: DietaryRestriction[];
    excludedIngredients: string[];
    preferredRetailers: RetailerId[];
  }) => Promise<void>;
  generatePlan: (request: PlanRequest) => Promise<WeeklyPlan>;
  swapMeal: (request: MealSwapRequest) => Promise<void>;
  modifyPlan: (mealId: string, instruction: string) => Promise<MockPlanModificationDraft>;
  selectBasketProduct: (
    retailerId: RetailerId,
    ingredientId: string,
    productId: string,
  ) => Promise<void>;
  toggleShoppingItem: (id: string) => Promise<void>;
  signIn: (provider: AuthProvider, email?: string, name?: string) => Promise<Account>;
  signOut: () => Promise<void>;
  clearApp: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function MealMabelProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PersistedAppState>(EMPTY_APP_STATE);
  const [ready, setReady] = useState(false);
  const [onboardingDraft, setOnboardingDraft] = useState<OnboardingDraft>(createDefaultDraft());
  const queryClient = useQueryClient();

  useEffect(() => {
    repository
      .load()
      .then((loaded) => {
        setState(loaded);
        if (loaded.profile?.household) {
          setOnboardingDraft(
            draftFromHousehold(loaded.profile.household, loaded.profile.preferences.dietType),
          );
        }
      })
      .catch(() => setState(EMPTY_APP_STATE))
      .finally(() => setReady(true));
  }, []);

  const persist = useCallback(async (next: PersistedAppState) => {
    setState(next);
    await repository.save(next);
  }, []);

  const householdFromDraft = useCallback(
    () =>
      createHousehold(onboardingDraft.adults, onboardingDraft.children, onboardingDraft.members),
    [onboardingDraft],
  );

  const completeOnboarding = useCallback(
    async (profile: UserProfile) => {
      await persist({
        ...state,
        onboardingComplete: true,
        profile: { ...profile, household: householdFromDraft() },
      });
    },
    [householdFromDraft, persist, state],
  );

  const saveHouseholdFromDraft = useCallback(async () => {
    if (!state.profile) {
      return;
    }
    const household = householdFromDraft();
    const targets = aggregateHouseholdTargets(household.members);
    const dietType = stricterDiet(
      state.profile.preferences.dietType ?? 'anything',
      requiredHouseholdDiet(household.members),
    );
    await persist({
      ...state,
      profile: {
        ...state.profile,
        household,
        updatedAt: new Date().toISOString(),
        preferences: {
          ...state.profile.preferences,
          dailyCalorieTarget: targets.caloriesKcal,
          dailyProteinTargetG: targets.proteinG,
          dailyFibreTargetG: targets.fibreG,
          dietType,
          dietaryPreferences: dietType === 'anything' ? ['none'] : [dietType],
          allergens: mergePreferenceAllergens(state.profile.preferences, household.members),
        },
      },
    });
  }, [householdFromDraft, persist, state]);

  const updatePreferences = useCallback(
    async (updates: {
      dietType: DietType;
      nutritionGoals: NutritionGoal[];
      dietaryRestrictions: DietaryRestriction[];
      excludedIngredients: string[];
      preferredRetailers: RetailerId[];
    }) => {
      if (!state.profile) {
        return;
      }
      const members = state.profile.household?.members ?? onboardingDraft.members;
      const dietType = stricterDiet(updates.dietType, requiredHouseholdDiet(members));
      const nextPreferences: UserPreferences = {
        ...state.profile.preferences,
        dietType,
        dietaryPreferences: dietType === 'anything' ? ['none'] : [dietType],
        nutritionGoals: updates.nutritionGoals,
        dietaryRestrictions: updates.dietaryRestrictions,
        excludedIngredients: updates.excludedIngredients,
        preferredRetailers: updates.preferredRetailers,
      };
      await persist({
        ...state,
        profile: {
          ...state.profile,
          updatedAt: new Date().toISOString(),
          preferences: {
            ...nextPreferences,
            allergens: mergePreferenceAllergens(nextPreferences, members),
          },
        },
      });
    },
    [onboardingDraft.members, persist, state],
  );

  const generatePlan = useCallback(
    async (request: PlanRequest) => {
      const plan = await planner.generatePlan(request);
      await persist({
        ...state,
        profile: state.profile
          ? {
              ...state.profile,
              household: request.household,
              preferences: request.preferences,
              updatedAt: new Date().toISOString(),
            }
          : null,
        currentPlan: plan,
        checkedShoppingItemIds: [],
      });
      await queryClient.invalidateQueries({ queryKey: ['plan-data'] });
      void analytics.track('plan_generated', {
        durationDays: request.durationDays ?? 7,
        mealTypeCount: request.mealsPerDay.length,
        retailerCount: request.preferences.preferredRetailers.length,
        weeklyBudget: request.preferences.maximumWeeklyBudget,
      });
      return plan;
    },
    [persist, queryClient, state],
  );

  const swapMeal = useCallback(
    async (request: MealSwapRequest) => {
      if (!state.currentPlan) return;
      const plan = await fastPlanner.swapMeal(state.currentPlan, request);
      await persist({
        ...state,
        currentPlan: plan,
        checkedShoppingItemIds: [],
      });
      await queryClient.invalidateQueries({ queryKey: ['plan-data'] });
      void analytics.track('meal_swapped', {
        mealId: request.mealId,
        reason: request.reason ?? null,
      });
    },
    [persist, queryClient, state],
  );

  const modifyPlan = useCallback(
    async (mealId: string, instruction: string): Promise<MockPlanModificationDraft> => {
      if (!state.currentPlan || !state.profile) {
        return { ok: false, reason: 'meal-not-found' };
      }
      const draft = createMockPlanModification(
        state.currentPlan,
        mealId,
        instruction,
        state.profile.preferences,
      );
      if (!draft.ok) return draft;

      const plan = await fastPlanner.modifyPlan(state.currentPlan, draft.request);
      await persist({
        ...state,
        currentPlan: plan,
        checkedShoppingItemIds: [],
      });
      await queryClient.invalidateQueries({ queryKey: ['plan-data'] });
      void analytics.track('plan_modified', {
        mealId,
        modificationType: draft.request.modifications[0]?.type ?? 'unknown',
      });
      return draft;
    },
    [persist, queryClient, state],
  );

  const selectBasketProduct = useCallback(
    async (retailerId: RetailerId, ingredientId: string, productId: string) => {
      const products = await catalogue.getProductsForIngredient(ingredientId);
      const product = products.find(
        (candidate) => candidate.id === productId && candidate.retailerId === retailerId,
      );
      if (!product) {
        throw new Error('The selected basket product is not available.');
      }
      await persist({
        ...state,
        productSelections: {
          ...state.productSelections,
          [productSelectionKey(retailerId, ingredientId)]: productId,
        },
      });
      await queryClient.invalidateQueries({ queryKey: ['plan-data'] });
    },
    [persist, queryClient, state],
  );

  const toggleShoppingItem = useCallback(
    async (id: string) => {
      const checked = state.checkedShoppingItemIds.includes(id);
      const nextIds = checked
        ? state.checkedShoppingItemIds.filter((itemId) => itemId !== id)
        : [...state.checkedShoppingItemIds, id];
      await persist({ ...state, checkedShoppingItemIds: nextIds });
    },
    [persist, state],
  );

  const signIn = useCallback(
    async (provider: AuthProvider, email?: string, name?: string) => {
      const account = await auth.signIn(provider, email, name);
      await persist({ ...state, account });
      return account;
    },
    [persist, state],
  );

  const signOut = useCallback(async () => {
    await persist({ ...state, account: null });
  }, [persist, state]);

  const clearApp = useCallback(async () => {
    await repository.clear();
    setState(EMPTY_APP_STATE);
    setOnboardingDraft(createDefaultDraft());
    queryClient.clear();
  }, [queryClient]);

  const value = useMemo(
    () => ({
      ready,
      state,
      onboardingDraft,
      setOnboardingDraft,
      completeOnboarding,
      saveHouseholdFromDraft,
      updatePreferences,
      generatePlan,
      swapMeal,
      modifyPlan,
      selectBasketProduct,
      toggleShoppingItem,
      signIn,
      signOut,
      clearApp,
    }),
    [
      clearApp,
      completeOnboarding,
      generatePlan,
      modifyPlan,
      onboardingDraft,
      ready,
      saveHouseholdFromDraft,
      selectBasketProduct,
      signIn,
      signOut,
      state,
      swapMeal,
      toggleShoppingItem,
      updatePreferences,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useMealMabelApp(): AppContextValue {
  const value = useContext(AppContext);
  if (!value) throw new Error('useMealMabelApp must be used inside MealMabelProvider.');
  return value;
}

export function usePlanData(): {
  shoppingList?: ShoppingList;
  comparison?: RetailerComparison;
  isLoading: boolean;
} {
  const { state } = useMealMabelApp();
  const plan = state.currentPlan;
  const query = useQuery({
    queryKey: ['plan-data', plan?.id, plan?.generatedAt, state.productSelections],
    enabled: Boolean(plan),
    queryFn: async () => {
      if (!plan) throw new Error('No weekly plan is available.');
      const shoppingList = await shopping.createList(plan);
      const comparison = await shopping.compareRetailers(
        aggregateIngredientRequirements(plan),
        state.productSelections,
      );
      return { shoppingList, comparison };
    },
  });
  return {
    shoppingList: query.data?.shoppingList,
    comparison: query.data?.comparison,
    isLoading: query.isLoading,
  };
}
