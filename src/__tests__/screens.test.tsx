import { fireEvent, render } from '@testing-library/react-native';
import { beforeEach, expect, jest, test } from '@jest/globals';
import { router, useLocalSearchParams } from 'expo-router';

import WelcomeScreen from '@/app/(onboarding)';
import HouseholdScreen from '@/app/(onboarding)/household';
import HomeScreen from '@/app/(tabs)';
import PlanScreen from '@/app/(tabs)/plan';
import ShopScreen from '@/app/(tabs)/shop';
import AskMabelScreen from '@/app/ask-mabel';
import CompareShopScreen from '@/app/compare-shop';
import CreatePlanScreen from '@/app/create-plan';
import { useMealMabelApp, usePlanData } from '@/app-state/app-provider';
import {
  aggregateIngredientRequirements,
  compareRetailers,
  createHousehold,
  createShoppingList,
  syncHouseholdMembers,
  type UserProfile,
} from '@/domain';
import { copy, formatAllergenList } from '@/copy';
import { SEEDED_GROCERY_CATALOGUE, SEEDED_WEEKLY_PLAN } from '@/fixtures';

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn(), back: jest.fn() },
  useLocalSearchParams: jest.fn(),
}));

jest.mock('@/app-state/app-provider', () => ({
  useMealMabelApp: jest.fn(),
  usePlanData: jest.fn(),
}));

const mockUseApp = jest.mocked(useMealMabelApp);
const mockUsePlanData = jest.mocked(usePlanData);
const mockUseLocalSearchParams = jest.mocked(useLocalSearchParams);
const EMPTY_APP_STATE = {
  version: 1 as const,
  onboardingComplete: false,
  profile: null,
  currentPlan: null,
  checkedShoppingItemIds: [],
};
const PROFILE = {
  id: 'local-user',
  name: 'You',
  householdId: 'household-local',
  preferences: {
    dietaryPreferences: ['none'],
    cookingEffort: 'normal',
    excludedIngredients: [],
    allergens: [],
    dailyCalorieTarget: 2200,
    dailyProteinTargetG: 130,
    maximumWeeklyBudget: 95,
    preferredRetailers: ['tesco', 'asda'],
    cookingTimeLimitMinutes: 40,
  },
  createdAt: '2026-08-01T00:00:00.000Z',
  updatedAt: '2026-08-01T00:00:00.000Z',
} satisfies UserProfile;

beforeEach(() => {
  mockUseLocalSearchParams.mockReturnValue({});
  mockUseApp.mockReturnValue({
    ready: true,
    state: { ...EMPTY_APP_STATE, onboardingComplete: true },
    onboardingDraft: {
      adults: 1,
      children: 0,
      members: syncHouseholdMembers(1, 0),
    },
    setOnboardingDraft: () => undefined,
    completeOnboarding: async () => undefined,
    saveHouseholdFromDraft: async () => undefined,
    generatePlan: async () => SEEDED_WEEKLY_PLAN,
    swapMeal: async () => undefined,
    modifyPlan: async () => ({ ok: false, reason: 'unsupported-request' }),
    selectBasketProduct: async () => undefined,
    toggleShoppingItem: async () => undefined,
    clearApp: async () => undefined,
  });
  mockUsePlanData.mockReturnValue({ isLoading: false });
});

test('onboarding introduces Mabel and offers a fast start', async () => {
  const view = await render(<WelcomeScreen />);
  expect(view.getByText(copy.welcome.headline)).toBeTruthy();
  expect(view.getByRole('button', { name: copy.welcome.getStarted })).toBeTruthy();
});

test('household setup captures a food preference for each person', async () => {
  const view = await render(<HouseholdScreen />);
  expect(view.getByText(copy.household.diet)).toBeTruthy();
  expect(view.getByRole('checkbox', { name: copy.diets.anything })).toBeTruthy();
  expect(view.getByRole('checkbox', { name: copy.diets.vegan })).toBeTruthy();
  expect(view.getByText(copy.household.allergens)).toBeTruthy();
  expect(view.getByRole('checkbox', { name: copy.allergens.milk })).toBeTruthy();
  expect(view.getByRole('checkbox', { name: copy.allergens.peanuts })).toBeTruthy();
});

test('create plan starts with all core choices visible', async () => {
  const view = await render(<CreatePlanScreen />);
  expect(view.getByText(copy.createPlan.budgetHeadline)).toBeTruthy();
  expect(view.getByText(copy.mealTypes.breakfast)).toBeTruthy();
  expect(view.getByText(copy.retailers.sainsburys)).toBeTruthy();
  expect(view.getByText(copy.createPlan.diet)).toBeTruthy();
  expect(view.getByRole('checkbox', { name: copy.diets.vegetarian })).toBeTruthy();
  expect(view.getByRole('checkbox', { name: copy.diets.vegan })).toBeTruthy();
  expect(view.getByRole('checkbox', { name: copy.diets.pescatarian })).toBeTruthy();
});

test('create plan sends the selected cooking effort into generation', async () => {
  const view = await render(<CreatePlanScreen />);
  await fireEvent.press(view.getByText(copy.createPlan.effort.enthusiastic.label));
  await fireEvent.press(view.getByText(copy.diets.vegetarian));
  await fireEvent.press(view.getByRole('button', { name: copy.createPlan.cta }));

  expect(jest.mocked(router.push)).toHaveBeenLastCalledWith(
    expect.objectContaining({
      params: expect.objectContaining({
        effort: 'enthusiastic',
        budget: '60',
        diet: 'vegetarian',
      }),
    }),
  );
});

test('create plan restores the saved budget, effort and retailers', async () => {
  mockUseApp.mockReturnValue({
    ...mockUseApp(),
    state: {
      ...EMPTY_APP_STATE,
      onboardingComplete: true,
      profile: PROFILE,
    },
  });

  const view = await render(<CreatePlanScreen />);
  expect(view.getByLabelText(copy.createPlan.budgetLabel).props.value).toBe('95');
  expect(
    view.getByRole('checkbox', {
      name: copy.createPlan.effort.normal.label,
    }).props.accessibilityState,
  ).toMatchObject({ checked: true });
  expect(
    view.getByRole('checkbox', { name: copy.retailers.sainsburys }).props.accessibilityState,
  ).toMatchObject({ checked: false });
});

test('create plan cannot loosen a person’s diet', async () => {
  const member = {
    ...syncHouseholdMembers(1, 0)[0],
    dietType: 'vegan' as const,
  };
  mockUseApp.mockReturnValue({
    ...mockUseApp(),
    state: {
      ...EMPTY_APP_STATE,
      onboardingComplete: true,
      profile: {
        ...PROFILE,
        household: createHousehold(1, 0, [member]),
        preferences: {
          ...PROFILE.preferences,
          dietType: 'vegan',
          dietaryPreferences: ['vegan'],
        },
      },
    },
  });

  const view = await render(<CreatePlanScreen />);
  expect(
    view.getByRole('checkbox', { name: copy.diets.anything }).props.accessibilityState,
  ).toMatchObject({ disabled: true });
  expect(
    view.getByRole('checkbox', { name: copy.diets.vegan }).props.accessibilityState,
  ).toMatchObject({ checked: true });
});

test('weekly plan renders seeded meals by day', async () => {
  mockUseApp.mockReturnValue({
    ...mockUseApp(),
    state: { ...EMPTY_APP_STATE, onboardingComplete: true, currentPlan: SEEDED_WEEKLY_PLAN },
  });
  const view = await render(<PlanScreen />);
  expect(view.getByText('Monday')).toBeTruthy();
  expect(view.getByText('Greek Yoghurt Protein Oats')).toBeTruthy();
  expect(
    view.getByText(copy.meal.contains(formatAllergenList(['milk', 'peanuts', 'gluten']))),
  ).toBeTruthy();
});

test('home compares the basket with the saved plan budget', async () => {
  const requirements = aggregateIngredientRequirements(SEEDED_WEEKLY_PLAN);
  const comparison = compareRetailers(requirements, SEEDED_GROCERY_CATALOGUE);
  const best = comparison.baskets.find(
    (basket) => basket.retailerId === comparison.cheapestRetailerId,
  )!;
  mockUseApp.mockReturnValue({
    ...mockUseApp(),
    state: {
      ...EMPTY_APP_STATE,
      onboardingComplete: true,
      currentPlan: SEEDED_WEEKLY_PLAN,
      profile: {
        ...PROFILE,
        preferences: {
          ...PROFILE.preferences,
          maximumWeeklyBudget: best.subtotal + 12.34,
        },
      },
    },
  });
  mockUsePlanData.mockReturnValue({
    isLoading: false,
    comparison,
  });

  const view = await render(<HomeScreen />);
  expect(view.getByText(copy.home.underBudget('£12.34'))).toBeTruthy();
});

test('Ask Mabel offers structured changes for the selected meal', async () => {
  const meal = SEEDED_WEEKLY_PLAN.days[0].meals[0];
  mockUseLocalSearchParams.mockReturnValue({ mealId: meal.id });
  mockUseApp.mockReturnValue({
    ...mockUseApp(),
    state: {
      ...EMPTY_APP_STATE,
      onboardingComplete: true,
      currentPlan: SEEDED_WEEKLY_PLAN,
    },
  });

  const view = await render(<AskMabelScreen />);
  expect(view.getByText(meal.recipe.name)).toBeTruthy();
  expect(view.getByText(copy.askMabel.suggestions[0])).toBeTruthy();
  expect(view.getByRole('button', { name: copy.askMabel.updateCta })).toBeDisabled();
});

test('Compare My Shop accepts a freeform shopping list', async () => {
  const view = await render(<CompareShopScreen />);
  expect(view.getByText(copy.compareShop.introTitle)).toBeTruthy();
  expect(view.getByLabelText(copy.compareShop.listLabel)).toBeTruthy();
  expect(view.getByRole('button', { name: copy.compareShop.compareCta })).toBeDisabled();
});

test('shop comparison identifies the best-value retailer', async () => {
  const requirements = aggregateIngredientRequirements(SEEDED_WEEKLY_PLAN);
  const comparison = compareRetailers(requirements, SEEDED_GROCERY_CATALOGUE);
  mockUseApp.mockReturnValue({
    ...mockUseApp(),
    state: { ...EMPTY_APP_STATE, onboardingComplete: true, currentPlan: SEEDED_WEEKLY_PLAN },
  });
  mockUsePlanData.mockReturnValue({
    isLoading: false,
    shoppingList: createShoppingList(SEEDED_WEEKLY_PLAN),
    comparison,
  });
  const view = await render(<ShopScreen />);
  await fireEvent.press(view.getByText(copy.shop.compareTab));
  const best = comparison.baskets.find(
    (basket) => basket.retailerId === comparison.cheapestRetailerId,
  );
  expect(view.getByText(best?.retailerName ?? '')).toBeTruthy();
  expect(view.getAllByText(copy.shop.bestValueBadge).length).toBeGreaterThan(0);
});
