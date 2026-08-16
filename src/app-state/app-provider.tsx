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
  syncHouseholdMembers,
} from '@/domain';
import type {
  Household,
  MealSwapRequest,
  PlanRequest,
  RetailerComparison,
  ShoppingList,
  UserProfile,
  WeeklyPlan,
} from '@/domain';
import { MockMealPlanningService, MockShoppingService } from '@/services';
import {
  AppStateRepository,
  EMPTY_APP_STATE,
  type PersistedAppState,
} from '@/storage';

const repository = new AppStateRepository();
const planner = new MockMealPlanningService({ delayMs: 2800 });
const fastPlanner = new MockMealPlanningService({ delayMs: 450 });
const shopping = new MockShoppingService({ delayMs: 120 });

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

function draftFromHousehold(household: Household): OnboardingDraft {
  return createDefaultDraft(household.adultCount, household.childCount, household.members);
}

interface AppContextValue {
  ready: boolean;
  state: PersistedAppState;
  onboardingDraft: OnboardingDraft;
  setOnboardingDraft: (draft: OnboardingDraft) => void;
  completeOnboarding: (profile: UserProfile) => Promise<void>;
  saveHouseholdFromDraft: () => Promise<void>;
  generatePlan: (request: PlanRequest) => Promise<WeeklyPlan>;
  swapMeal: (request: MealSwapRequest) => Promise<void>;
  toggleShoppingItem: (id: string) => Promise<void>;
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
          setOnboardingDraft(draftFromHousehold(loaded.profile.household));
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
    () => createHousehold(onboardingDraft.adults, onboardingDraft.children, onboardingDraft.members),
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
        },
      },
    });
  }, [householdFromDraft, persist, state]);

  const generatePlan = useCallback(
    async (request: PlanRequest) => {
      const plan = await planner.generatePlan(request);
      await persist({
        ...state,
        currentPlan: plan,
        checkedShoppingItemIds: [],
      });
      await queryClient.invalidateQueries({ queryKey: ['plan-data'] });
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
      generatePlan,
      swapMeal,
      toggleShoppingItem,
      clearApp,
    }),
    [
      clearApp,
      completeOnboarding,
      generatePlan,
      onboardingDraft,
      ready,
      saveHouseholdFromDraft,
      state,
      swapMeal,
      toggleShoppingItem,
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
    queryKey: ['plan-data', plan?.id, plan?.generatedAt],
    enabled: Boolean(plan),
    queryFn: async () => {
      if (!plan) throw new Error('No weekly plan is available.');
      const shoppingList = await shopping.createList(plan);
      const comparison = await shopping.compareRetailers(
        aggregateIngredientRequirements(plan),
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

