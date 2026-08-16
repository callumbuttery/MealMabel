import type { Meal, MealType, PlanDay, WeeklyPlan } from '@/domain/models';
import {
  calculateDayNutrition,
  calculatePlanNutrition,
} from '@/domain/nutrition';
import { getRecipeById } from '@/fixtures/recipes';

interface DaySeed {
  date: string;
  dayName: string;
  recipes: readonly [string, string, string];
}

const DAY_SEEDS: DaySeed[] = [
  {
    date: '2026-08-17',
    dayName: 'Monday',
    recipes: ['greek-yoghurt-oats', 'chicken-grain-bowl', 'salmon-potato-traybake'],
  },
  {
    date: '2026-08-18',
    dayName: 'Tuesday',
    recipes: ['egg-spinach-toast', 'tuna-bean-salad', 'turkey-chilli'],
  },
  {
    date: '2026-08-19',
    dayName: 'Wednesday',
    recipes: ['banana-protein-pancakes', 'turkey-hummus-wrap', 'beef-stir-fry'],
  },
  {
    date: '2026-08-20',
    dayName: 'Thursday',
    recipes: ['greek-yoghurt-oats', 'lentil-cottage-cheese-bowl', 'chickpea-tofu-curry'],
  },
  {
    date: '2026-08-21',
    dayName: 'Friday',
    recipes: ['egg-spinach-toast', 'chicken-pesto-pasta', 'cod-pea-mash'],
  },
  {
    date: '2026-08-22',
    dayName: 'Saturday',
    recipes: ['banana-protein-pancakes', 'tuna-bean-salad', 'chicken-grain-bowl'],
  },
  {
    date: '2026-08-23',
    dayName: 'Sunday',
    recipes: ['greek-yoghurt-oats', 'turkey-hummus-wrap', 'turkey-chilli'],
  },
];

const MEAL_TYPES: readonly MealType[] = ['breakfast', 'lunch', 'dinner'];

function createMeal(date: string, recipeId: string, type: MealType): Meal {
  return {
    id: `${date}-${type}`,
    type,
    recipe: getRecipeById(recipeId),
    servings: 2,
  };
}

function createDay(seed: DaySeed): PlanDay {
  const meals = seed.recipes.map((recipeId, index) =>
    createMeal(seed.date, recipeId, MEAL_TYPES[index]),
  );
  return {
    date: seed.date,
    dayName: seed.dayName,
    meals,
    nutrition: calculateDayNutrition(meals),
  };
}

const days = DAY_SEEDS.map(createDay);

export const SEEDED_WEEKLY_PLAN: WeeklyPlan = {
  id: 'plan-2026-08-17',
  weekStarting: '2026-08-17',
  householdServings: 2,
  days,
  nutrition: calculatePlanNutrition(days),
  generatedAt: '2026-08-16T10:00:00.000Z',
};
