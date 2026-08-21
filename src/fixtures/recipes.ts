import type {
  AllergenId,
  IngredientUnit,
  MealType,
  NutritionSummary,
  Recipe,
  RecipeIngredient,
} from '@/domain/models';

const ingredient = (
  ingredientId: string,
  name: string,
  quantity: number,
  unit: IngredientUnit,
): RecipeIngredient => ({ ingredientId, name, quantity, unit });

const nutrition = (
  caloriesKcal: number,
  proteinG: number,
  carbohydratesG: number,
  fatG: number,
  fibreG: number,
): NutritionSummary => ({
  caloriesKcal,
  proteinG,
  carbohydratesG,
  fatG,
  fibreG,
});

interface RecipeSeed {
  id: string;
  name: string;
  description: string;
  mealTypes: MealType[];
  prep: number;
  cook: number;
  ingredients: RecipeIngredient[];
  nutrition: NutritionSummary;
  tags: string[];
  allergens?: AllergenId[];
}

const recipe = (seed: RecipeSeed): Recipe => ({
  id: seed.id,
  name: seed.name,
  description: seed.description,
  mealTypes: seed.mealTypes,
  prepTimeMinutes: seed.prep,
  cookTimeMinutes: seed.cook,
  servings: 2,
  ingredients: seed.ingredients,
  instructions: [
    'Prepare the ingredients as listed.',
    'Cook until piping hot and well combined.',
    'Divide between two plates and serve.',
  ],
  nutritionPerServing: seed.nutrition,
  tags: ['high-protein', ...seed.tags],
  allergens: seed.allergens ?? [],
});

export const SEEDED_RECIPES: Recipe[] = [
  recipe({
    id: 'greek-yoghurt-oats',
    name: 'Greek Yoghurt Protein Oats',
    description: 'Creamy overnight oats with berries and peanut butter.',
    mealTypes: ['breakfast'],
    prep: 8,
    cook: 0,
    ingredients: [
      ingredient('oats', 'Rolled oats', 100, 'g'),
      ingredient('greek-yoghurt', '0% Greek yoghurt', 300, 'g'),
      ingredient('berries', 'Frozen mixed berries', 160, 'g'),
      ingredient('peanut-butter', 'Peanut butter', 30, 'g'),
    ],
    nutrition: nutrition(438, 29, 54, 12, 9),
    tags: ['vegetarian', 'meal-prep'],
    allergens: ['milk', 'peanuts', 'gluten'],
  }),
  recipe({
    id: 'banana-berry-oats',
    name: 'Banana & Berry Overnight Oats',
    description: 'Creamy oat pots with banana and mixed berries.',
    mealTypes: ['breakfast'],
    prep: 8,
    cook: 0,
    ingredients: [
      ingredient('oats', 'Rolled oats', 120, 'g'),
      ingredient('banana', 'Bananas', 2, 'each'),
      ingredient('berries', 'Frozen mixed berries', 160, 'g'),
    ],
    nutrition: nutrition(390, 13, 72, 6, 11),
    tags: ['vegan', 'meal-prep', 'quick'],
    allergens: ['gluten'],
  }),
  recipe({
    id: 'egg-spinach-toast',
    name: 'Egg, Spinach & Cottage Cheese Toast',
    description: 'Soft scrambled eggs and spinach on seeded toast.',
    mealTypes: ['breakfast'],
    prep: 5,
    cook: 10,
    ingredients: [
      ingredient('eggs', 'Eggs', 4, 'each'),
      ingredient('spinach', 'Baby spinach', 100, 'g'),
      ingredient('cottage-cheese', 'Cottage cheese', 160, 'g'),
      ingredient('seeded-bread', 'Seeded wholemeal bread', 4, 'each'),
    ],
    nutrition: nutrition(454, 35, 34, 20, 7),
    tags: ['vegetarian', 'quick'],
    allergens: ['eggs', 'milk', 'gluten'],
  }),
  recipe({
    id: 'banana-protein-pancakes',
    name: 'Banana Protein Pancakes',
    description: 'Oat and banana pancakes topped with yoghurt.',
    mealTypes: ['breakfast'],
    prep: 8,
    cook: 12,
    ingredients: [
      ingredient('banana', 'Bananas', 2, 'each'),
      ingredient('eggs', 'Eggs', 4, 'each'),
      ingredient('oats', 'Rolled oats', 100, 'g'),
      ingredient('greek-yoghurt', '0% Greek yoghurt', 200, 'g'),
    ],
    nutrition: nutrition(421, 27, 51, 13, 7),
    tags: ['vegetarian'],
    allergens: ['eggs', 'milk', 'gluten'],
  }),
  recipe({
    id: 'chicken-grain-bowl',
    name: 'Lemon Chicken Grain Bowl',
    description: 'Herby chicken, brown rice and crunchy vegetables.',
    mealTypes: ['lunch', 'dinner'],
    prep: 10,
    cook: 20,
    ingredients: [
      ingredient('chicken-breast', 'Chicken breast', 320, 'g'),
      ingredient('brown-rice', 'Brown rice', 150, 'g'),
      ingredient('broccoli', 'Broccoli', 250, 'g'),
      ingredient('lemon', 'Lemon', 1, 'each'),
    ],
    nutrition: nutrition(568, 52, 61, 11, 9),
    tags: ['balanced'],
  }),
  recipe({
    id: 'tuna-bean-salad',
    name: 'Tuna & Butter Bean Salad',
    description: 'A bright, filling tuna salad with lemon dressing.',
    mealTypes: ['lunch'],
    prep: 12,
    cook: 0,
    ingredients: [
      ingredient('tuna', 'Tuna in spring water', 290, 'g'),
      ingredient('butter-beans', 'Butter beans', 240, 'g'),
      ingredient('tomatoes', 'Cherry tomatoes', 250, 'g'),
      ingredient('spinach', 'Baby spinach', 100, 'g'),
      ingredient('lemon', 'Lemon', 1, 'each'),
    ],
    nutrition: nutrition(430, 47, 39, 8, 12),
    tags: ['pescatarian', 'no-cook'],
    allergens: ['fish'],
  }),
  recipe({
    id: 'turkey-hummus-wrap',
    name: 'Turkey Hummus Crunch Wrap',
    description: 'Lean turkey, hummus and salad in wholemeal wraps.',
    mealTypes: ['lunch'],
    prep: 10,
    cook: 0,
    ingredients: [
      ingredient('turkey-mince', 'Lean turkey mince', 300, 'g'),
      ingredient('wholemeal-wraps', 'Wholemeal wraps', 4, 'each'),
      ingredient('hummus', 'Hummus', 120, 'g'),
      ingredient('peppers', 'Mixed peppers', 200, 'g'),
    ],
    nutrition: nutrition(520, 43, 50, 17, 9),
    tags: ['quick'],
    allergens: ['sesame', 'gluten'],
  }),
  recipe({
    id: 'lentil-cottage-cheese-bowl',
    name: 'Warm Lentil & Cottage Cheese Bowl',
    description: 'Spiced lentils, roast vegetables and cottage cheese.',
    mealTypes: ['lunch'],
    prep: 10,
    cook: 20,
    ingredients: [
      ingredient('lentils', 'Green lentils', 250, 'g'),
      ingredient('cottage-cheese', 'Cottage cheese', 250, 'g'),
      ingredient('courgette', 'Courgette', 250, 'g'),
      ingredient('peppers', 'Mixed peppers', 200, 'g'),
    ],
    nutrition: nutrition(465, 35, 54, 11, 16),
    tags: ['vegetarian'],
    allergens: ['milk'],
  }),
  recipe({
    id: 'chickpea-rice-bowl',
    name: 'Chickpea & Pepper Rice Bowl',
    description: 'A colourful chickpea bowl with brown rice and greens.',
    mealTypes: ['lunch', 'dinner'],
    prep: 10,
    cook: 20,
    ingredients: [
      ingredient('chickpeas', 'Chickpeas', 240, 'g'),
      ingredient('brown-rice', 'Brown rice', 150, 'g'),
      ingredient('peppers', 'Mixed peppers', 200, 'g'),
      ingredient('spinach', 'Baby spinach', 100, 'g'),
    ],
    nutrition: nutrition(510, 20, 87, 9, 17),
    tags: ['vegan', 'balanced'],
  }),
  recipe({
    id: 'chicken-pesto-pasta',
    name: 'Chicken Pesto Protein Pasta',
    description: 'Chicken and wholewheat pasta in a light pesto sauce.',
    mealTypes: ['lunch', 'dinner'],
    prep: 8,
    cook: 20,
    ingredients: [
      ingredient('chicken-breast', 'Chicken breast', 320, 'g'),
      ingredient('wholewheat-pasta', 'Wholewheat pasta', 170, 'g'),
      ingredient('pesto', 'Green pesto', 60, 'g'),
      ingredient('spinach', 'Baby spinach', 120, 'g'),
    ],
    nutrition: nutrition(625, 55, 65, 18, 10),
    tags: ['family-friendly'],
    allergens: ['milk', 'nuts', 'gluten'],
  }),
  recipe({
    id: 'salmon-potato-traybake',
    name: 'Salmon & Greens Traybake',
    description: 'Roast salmon, baby potatoes and broccoli.',
    mealTypes: ['dinner'],
    prep: 10,
    cook: 25,
    ingredients: [
      ingredient('salmon', 'Salmon fillets', 260, 'g'),
      ingredient('potatoes', 'Baby potatoes', 500, 'g'),
      ingredient('broccoli', 'Broccoli', 300, 'g'),
      ingredient('lemon', 'Lemon', 1, 'each'),
    ],
    nutrition: nutrition(590, 42, 53, 23, 9),
    tags: ['pescatarian'],
    allergens: ['fish'],
  }),
  recipe({
    id: 'turkey-chilli',
    name: 'Smoky Turkey Chilli',
    description: 'Lean turkey and kidney bean chilli with brown rice.',
    mealTypes: ['dinner'],
    prep: 10,
    cook: 25,
    ingredients: [
      ingredient('turkey-mince', 'Lean turkey mince', 400, 'g'),
      ingredient('kidney-beans', 'Kidney beans', 240, 'g'),
      ingredient('chopped-tomatoes', 'Chopped tomatoes', 400, 'g'),
      ingredient('brown-rice', 'Brown rice', 140, 'g'),
      ingredient('peppers', 'Mixed peppers', 200, 'g'),
    ],
    nutrition: nutrition(610, 53, 68, 13, 15),
    tags: ['batch-cook'],
  }),
  recipe({
    id: 'beef-stir-fry',
    name: 'Ginger Beef Stir-fry',
    description: 'Lean beef and vegetables with wholewheat noodles.',
    mealTypes: ['dinner'],
    prep: 12,
    cook: 15,
    ingredients: [
      ingredient('lean-beef', 'Lean beef strips', 300, 'g'),
      ingredient('wholewheat-noodles', 'Wholewheat noodles', 160, 'g'),
      ingredient('stir-fry-veg', 'Stir-fry vegetables', 400, 'g'),
      ingredient('soy-sauce', 'Reduced-salt soy sauce', 40, 'ml'),
    ],
    nutrition: nutrition(575, 46, 62, 16, 10),
    tags: ['quick'],
    allergens: ['soya', 'gluten'],
  }),
  recipe({
    id: 'chickpea-tofu-curry',
    name: 'Tofu & Chickpea Curry',
    description: 'A creamy tomato curry with tofu and chickpeas.',
    mealTypes: ['dinner'],
    prep: 10,
    cook: 25,
    ingredients: [
      ingredient('tofu', 'Firm tofu', 400, 'g'),
      ingredient('chickpeas', 'Chickpeas', 240, 'g'),
      ingredient('chopped-tomatoes', 'Chopped tomatoes', 400, 'g'),
      ingredient('light-coconut-milk', 'Light coconut milk', 400, 'ml'),
      ingredient('brown-rice', 'Brown rice', 140, 'g'),
    ],
    nutrition: nutrition(620, 32, 73, 24, 16),
    tags: ['vegan', 'batch-cook'],
    allergens: ['soya'],
  }),
  recipe({
    id: 'cod-pea-mash',
    name: 'Baked Cod with Pea Mash',
    description: 'Flaky cod with protein-rich peas and potatoes.',
    mealTypes: ['dinner'],
    prep: 10,
    cook: 25,
    ingredients: [
      ingredient('cod', 'Cod fillets', 300, 'g'),
      ingredient('peas', 'Frozen peas', 300, 'g'),
      ingredient('potatoes', 'Baby potatoes', 450, 'g'),
      ingredient('greek-yoghurt', '0% Greek yoghurt', 80, 'g'),
    ],
    nutrition: nutrition(520, 47, 66, 7, 13),
    tags: ['pescatarian'],
    allergens: ['fish', 'milk'],
  }),
];

export function getRecipeById(recipeId: string): Recipe {
  const found = SEEDED_RECIPES.find((candidate) => candidate.id === recipeId);
  if (!found) {
    throw new Error(`Unknown recipe: ${recipeId}`);
  }
  return found;
}
