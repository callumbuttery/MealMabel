import type {
  CookingEffort,
  DietType,
  DietaryRestriction,
  HouseholdMemberKind,
  MealType,
  NutritionGoal,
  RetailerId,
} from '@/domain/models';

export function formatGbp(amount: number): string {
  return `£${amount.toFixed(2)}`;
}

export function formatKcal(amount: number): string {
  return `${amount} kcal`;
}

export function formatGrams(amount: number): string {
  return `${amount}g`;
}

export function formatProteinG(amount: number): string {
  return `${formatGrams(amount)} protein`;
}

export function formatMinutes(amount: number): string {
  return `${amount} min`;
}

export const copy = {
  a11y: {
    back: 'Go back',
    close: 'Close',
    closeSheet: 'Close sheet',
    clearSearch: 'Clear search',
    mabel: 'Mabel',
    mabelAssistant: 'Mabel assistant',
    mealImagePlaceholder: 'Meal image placeholder',
    loading: (label: string) => `${label}, loading`,
  },
  common: {
    continue: 'Continue',
    tryAgain: 'Try again',
    edit: 'Edit',
    view: 'View',
    noneAdded: 'None added',
    dash: '—',
    grams: 'grams',
    items: (count: number) => `${count} items`,
    servings: (count: number) => (count === 1 ? '1 serving' : `${count} servings`),
    emDashQuantity: (quantity: number, unit: string) => `${quantity}${unit}`,
  },
  tabs: {
    home: 'Home',
    plan: 'Plan',
    shop: 'Shop',
    profile: 'Profile',
  },
  launch: {
    loading: 'Getting your kitchen ready…',
  },
  welcome: {
    headline: 'Meet Mabel.',
    body: "Your smart weekly food assistant. Tell Mabel your budget, goals and preferences and she'll plan the week — right down to the shopping list.",
    getStarted: 'Get started',
    haveAccount: 'I already have an account',
  },
  household: {
    title: 'Who are we feeding?',
    intro:
      'Set a typical diet for anyone you like, or give someone exact calorie, protein and fibre targets.',
    adults: 'Adults',
    children: 'Children',
    adultsStepper: 'adults',
    childrenStepper: 'children',
    peopleTitle: 'People',
    peopleSubtitle: 'Leave someone on a typical diet, or set exact daily targets.',
    name: 'Name',
    typicalDiet: 'Typical diet',
    customTargets: 'Custom targets',
    customShort: 'Custom',
    weight: 'Weight (optional)',
    weightHelper: 'Kilograms. Used to size a typical diet if you do not set custom targets.',
    calories: 'Calories / day',
    protein: 'Protein / day',
    fibre: 'Fibre / day',
    nutritionLine: (kcal: string, protein: string, fibre: string) =>
      `${kcal} kcal · ${protein}g protein · ${fibre}g fibre`,
    typicalSummary: (summary: string) => `Typical: ${summary}`,
    memberSummary: (mode: string, summary: string) => `${mode} · ${summary}`,
    nameWithWeight: (name: string, weightKg: number) => `${name} · ${weightKg}kg`,
    adultPlaceholder: 'Adult 1',
    childPlaceholder: 'Child 1',
    adultWeightPlaceholder: '80',
    childWeightPlaceholder: '30',
    defaultName: (kind: HouseholdMemberKind, index: number) =>
      kind === 'adult' ? `Adult ${index}` : `Child ${index}`,
  },
  editHousehold: {
    title: 'Household',
    intro: 'These targets stay on this device and shape how Mabel plans meals for the household.',
    save: 'Save people',
  },
  preferences: {
    title: 'What matters to you?',
    diet: 'Diet',
    dietSubtitle: 'Choose one',
    goals: 'Goals',
    goalsSubtitle: 'Choose as many as you like',
    restrictions: 'Dietary restrictions',
    dislikesQuestion: "Anything you don't eat?",
    dislikesLabel: 'Disliked foods',
    dislikesPlaceholder: 'Mushrooms, tuna, olives...',
    finish: 'Finish setup',
    defaultDislikes: 'Mushrooms',
  },
  diets: {
    anything: 'Anything',
    vegetarian: 'Vegetarian',
    vegan: 'Vegan',
    pescatarian: 'Pescatarian',
  } satisfies Record<DietType, string>,
  goals: {
    high_protein: 'High protein',
    lower_calorie: 'Lower calorie',
    high_fibre: 'High fibre',
    five_a_day: '5-a-day',
    cheapest_possible: 'Cheapest possible',
  } satisfies Record<NutritionGoal, string>,
  restrictions: {
    nut_free: 'Nut free',
    dairy_free: 'Dairy free',
    gluten_free: 'Gluten free',
    egg_free: 'Egg free',
  } satisfies Record<DietaryRestriction, string>,
  mealTypes: {
    breakfast: 'Breakfast',
    lunch: 'Lunch',
    dinner: 'Dinner',
  } satisfies Record<MealType, string>,
  retailers: {
    tesco: 'Tesco',
    asda: 'Asda',
    sainsburys: "Sainsbury's",
  } satisfies Record<RetailerId, string>,
  home: {
    greeting: 'Good morning',
    headline: 'What are we eating this week?',
    thisWeek: 'This week',
    meals: 'meals',
    estimatedShop: 'estimated shop',
    bestShop: 'best shop',
    comparing: 'Comparing',
    weekSorted: 'Your week is sorted',
    underBudget: (amount: string) => `I've planned the week and kept you ${amount} under budget.`,
    checkingShop: "I'm checking the best-value shop for your plan.",
    viewPlan: 'View plan',
    viewList: 'View shopping list',
    planWeek: 'Plan my week',
    planWeekBody: "Give Mabel your budget and goals and she'll sort the rest.",
    startPlanning: 'Start planning',
    compareTitle: 'Compare a shopping list',
    compareBody: 'Already know what you need? Let Mabel find the best-value shop.',
    compareCta: 'Compare my shop',
    planDifferentWeek: 'Plan a different week',
  },
  createPlan: {
    title: 'Plan my week',
    budgetHeadline: "What's the budget?",
    budgetLabel: 'Weekly food budget',
    budgetHelper: 'Between £20 and £300',
    validation: 'Choose at least one meal and shop, with a £20–£300 budget.',
    meals: 'Which meals should Mabel plan?',
    days: 'How many days?',
    daysOption: (count: number) => `${count} days`,
    priorities: 'Priorities',
    lowEffort: 'Low effort',
    cooking: 'Cooking effort',
    shops: 'Where could you shop?',
    cta: 'Let Mabel plan it',
    effort: {
      easy: {
        label: 'Easy',
        body: 'Mostly 10–20 minute meals',
      },
      normal: {
        label: 'Normal',
        body: 'Typical weekday cooking',
      },
      enthusiastic: {
        label: 'I like cooking',
        body: 'More involved recipes',
      },
    } satisfies Record<CookingEffort, { label: string; body: string }>,
  },
  generating: {
    steps: [
      'Planning your meals…',
      'Making ingredients work harder…',
      'Checking your shopping list…',
      'Comparing Tesco, Asda and Sainsbury’s…',
      'Nearly there…',
    ],
    body: 'Mabel is balancing your budget, nutrition and realistic supermarket pack sizes.',
    missingPreferences: 'Your preferences could not be loaded.',
    failed: "I couldn't finish that plan. Your preferences are safe — give me another go.",
    retryTitle: "Let's try that again",
  },
  plan: {
    title: 'Your week',
    emptyTitle: 'No plan yet',
    emptyBody: 'Tell Mabel what you need and your week will appear here.',
    emptyCta: 'Plan my week',
    weekSummary: (meals: number, protein: number) => `${meals} meals · ~${protein}g protein/day`,
    daySummary: (kcal: number, protein: number) => `${kcal} kcal · ${protein}g protein`,
    mealCardCost: (kcal: number, protein: number) => `${kcal} kcal · ${protein}g protein`,
  },
  planSummary: {
    loading: 'Finishing your basket comparison…',
    headline: 'Your week is sorted.',
    meals: 'meals',
    estimatedShop: 'estimated shop',
    underBudget: 'under budget',
    proteinDay: 'protein/day',
    proteinValue: (grams: number) => `~${grams}g`,
    recommendBadge: 'Top pick',
    recommendTitle: (retailer: string) => `Mabel recommends ${retailer}.`,
    recommendBody: (shop: string, saving: string) =>
      `Your full shop comes to ${shop} — ${saving} cheaper than the most expensive option.`,
    seeWeek: 'See my week',
    seeList: 'See shopping list',
  },
  meal: {
    fallbackTitle: 'Meal',
    missing: 'This meal is no longer in your current plan.',
    energy: 'Energy',
    protein: 'Protein',
    time: 'Time',
    ingredients: 'Ingredients',
    method: 'Method',
    swap: 'Swap this meal',
    ask: 'Ask Mabel',
    swapTitle: 'Swap this for…',
    swapPrompt: 'Tell Mabel what you want',
    swapPlaceholder: 'Replace this with a chicken pasta dish',
    swapCta: 'Swap meal',
    askTitle: 'Ask Mabel',
    askInsightTitle: 'Edit this plan',
    askInsightBody: "Tell me what should change and I'll keep the shopping list in sync.",
    askLabel: 'Your request',
    askPlaceholder: 'Make this quicker to cook',
    askCta: 'Update my plan',
    subtitle: (dayName: string, mealType: string) => `${dayName} ${mealType}`,
    options: [
      'Something cheaper',
      'More protein',
      'Fewer calories',
      'Quicker to cook',
      'Something different',
    ],
  },
  askMabel: {
    title: 'Ask Mabel',
    subtitle: (day: string, mealType: string) => `${day} ${mealType}`,
    missing: 'That meal is no longer in your current plan.',
    insightTitle: 'What should change?',
    insightBody:
      'Ask for a quicker, higher-protein or lighter option. You can also change servings or remove the meal.',
    suggestions: [
      'Make it quicker',
      'Add more protein',
      'Lower the calories',
      'Serve 4 people',
      'Remove this meal',
    ],
    requestLabel: 'Your request',
    requestPlaceholder: 'Make this quicker to cook',
    updateCta: 'Update my plan',
    unsupported:
      'I can change the speed, protein, calories or servings, swap the recipe, or remove this meal.',
    noSafeMatch:
      "I couldn't find a suitable replacement without breaking your household preferences.",
    noBetterMatch:
      "I couldn't find a better match for that request, so I left your plan unchanged.",
    failed: "I couldn't update the plan just now. Please try again.",
    successTitle: 'Plan updated',
    swapped: (before: string, after: string) =>
      `I've replaced ${before} with ${after}. Your shopping list and shop comparison are up to date.`,
    removed: (meal: string) =>
      `I've removed ${meal}. Your shopping list and shop comparison are up to date.`,
    servingsChanged: (meal: string, servings: number) =>
      `I've changed ${meal} to ${servings} servings. Your shopping list and shop comparison are up to date.`,
    seePlan: 'See updated plan',
    anotherChange: 'Make another change',
  },
  compareShop: {
    title: 'Compare my shop',
    introTitle: 'Paste your shopping list',
    introBody:
      'Put one item on each line. Mabel will match what she can to demo supermarket packs.',
    listLabel: 'Shopping list',
    listPlaceholder: '500g chicken breast\nBrown rice\n2 broccoli\n12 eggs',
    compareCta: 'Compare shops',
    emptyError: 'Add at least one item to compare.',
    noMatches:
      "I couldn't match anything on that list yet. Try simple item names such as chicken, rice or eggs.",
    loading: 'Matching your list to supermarket packs…',
    resultsTitle: 'Your comparison',
    matchedSummary: (matched: number, unmatched: number) =>
      unmatched > 0 ? `${matched} matched · ${unmatched} not matched` : `${matched} items matched`,
    bestBadge: 'Best overall',
    bestTitle: (retailer: string) => `${retailer} is cheapest overall.`,
    bestBody: (total: string, saving: string) =>
      `The matched shop comes to ${total}, saving ${saving} against the most expensive option.`,
    retailersTitle: 'Full shop comparison',
    individualTitle: 'Cheapest individual items',
    individualBody:
      'See the cheapest matched pack at each shop. This does not plan a multi-store route.',
    unmatchedTitle: 'Not matched',
    unmatchedBody: (items: string) =>
      `Try a simpler name for: ${items}. These are not included in the totals.`,
    editList: 'Edit shopping list',
    packDetail: (count: number, size: string) => `${count} × ${size}`,
  },
  shop: {
    title: 'Shop',
    yourShop: 'Your shop',
    emptyTitle: 'Nothing on the list',
    emptyBody: 'Create a meal plan and Mabel will aggregate every ingredient.',
    emptyCta: 'Plan my week',
    loading: 'Matching real pack sizes…',
    listTab: 'Shopping list',
    compareTab: 'Compare shops',
    summary: (items: number, checked: number, total?: string) =>
      total
        ? `${items} items · ${checked} checked · ${total}`
        : `${items} items · ${checked} checked`,
    needed: (quantity: number, unit: string) => `Needed: ${quantity}${unit}`,
    bestValueBadge: 'Best value',
    bestValueTitle: (retailer: string) => `${retailer} is best value.`,
    bestValueBody: (retailer: string, saving: string) =>
      `${retailer} is ${saving} cheaper than the most expensive full shop.`,
    categories: {
      fruitVeg: 'Fruit & veg',
      meatFish: 'Meat & fish',
      dairyEggs: 'Dairy & eggs',
      bakery: 'Bakery',
      cupboard: 'Cupboard',
      frozen: 'Frozen',
      drinks: 'Drinks',
      other: 'Other',
    },
  },
  retailer: {
    loading: 'Opening your basket…',
    shopTitle: (name: string) => `Your ${name} shop`,
    incompleteTitle: 'Basket incomplete',
    incompleteBody: (count: number) => `I couldn't find suitable matches for ${count} items.`,
    packLine: (count: number, size: string, price: string) => `${count} × ${size} at ${price}`,
    chooseAnother: 'Choose another product',
    chooseThis: 'Choose this product',
    onlyMatchTitle: 'Best available match',
    onlyMatchBody: 'This is the only suitable demo product for this ingredient.',
    productMeta: (size: string, price: string) => `${size} · ${price}`,
  },
  profile: {
    title: 'Profile',
    defaultName: 'You',
    household: 'Household',
    dietGoals: 'Diet & goals',
    dislikes: 'Dislikes',
    supermarkets: 'Supermarkets',
    supermarketList: "Tesco · Asda · Sainsbury's",
    account: 'Account',
    accountBody: 'Demo account · Stored on this device',
    about: 'About',
    privacy: 'Privacy',
    terms: 'Terms',
    version: 'Version',
    versionValue: '1.0.0',
    reset: 'Reset demo',
  },
  components: {
    weeklyBudget: 'Weekly budget',
    overBudget: 'Over budget',
    bestValue: 'Best value',
    mabelTip: "Mabel's tip",
    loadingDefault: 'Mabel is preparing things…',
    remaining: (amount: string) => `${amount} remaining`,
    overBy: (amount: string) => `${amount} over`,
    spentOf: (spent: string, budget: string) => `${spent} spent of ${budget} budget`,
    logo: (name: string) => `${name} logo`,
    bestValueSuffix: ', best value',
  },
} as const;

export type ShoppingCategoryId = keyof typeof copy.shop.categories;

export function shoppingCategoryFor(ingredientId: string): ShoppingCategoryId {
  if (/chicken|beef|turkey|salmon|cod|tuna/.test(ingredientId)) return 'meatFish';
  if (/milk|yoghurt|cheddar|egg|cottage/.test(ingredientId)) return 'dairyEggs';
  if (/bread|wrap/.test(ingredientId)) return 'bakery';
  if (/pepper|onion|broccoli|spinach|banana|apple|blueberr|potato/.test(ingredientId)) {
    return 'fruitVeg';
  }
  if (/frozen/.test(ingredientId)) return 'frozen';
  if (/coke|juice|water|milk/.test(ingredientId)) return 'drinks';
  return 'cupboard';
}
