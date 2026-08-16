import type {
  GroceryProduct,
  IngredientUnit,
  ProductNutrition,
  RetailerId,
} from '@/domain/models';

interface ProductSeed {
  ingredientId: string;
  name: string;
  packQuantity: number;
  packUnit: IngredientUnit;
  price: number;
  nutrition?: ProductNutrition;
}

const PRODUCT_SEEDS: ProductSeed[] = [
  { ingredientId: 'oats', name: 'Wholegrain Oats', packQuantity: 500, packUnit: 'g', price: 0.9 },
  { ingredientId: 'greek-yoghurt', name: '0% Greek Style Yoghurt', packQuantity: 500, packUnit: 'g', price: 1.35 },
  { ingredientId: 'berries', name: 'Frozen Mixed Berries', packQuantity: 500, packUnit: 'g', price: 2.25 },
  { ingredientId: 'peanut-butter', name: 'Smooth Peanut Butter', packQuantity: 340, packUnit: 'g', price: 1.35 },
  { ingredientId: 'eggs', name: 'Medium Free Range Eggs', packQuantity: 12, packUnit: 'each', price: 2.15 },
  { ingredientId: 'spinach', name: 'Baby Spinach', packQuantity: 250, packUnit: 'g', price: 1.05 },
  { ingredientId: 'cottage-cheese', name: 'Low Fat Cottage Cheese', packQuantity: 300, packUnit: 'g', price: 1.25 },
  { ingredientId: 'seeded-bread', name: 'Seeded Wholemeal Loaf', packQuantity: 18, packUnit: 'each', price: 1.25 },
  { ingredientId: 'banana', name: 'Bananas', packQuantity: 6, packUnit: 'each', price: 1.05 },
  { ingredientId: 'chicken-breast', name: 'Chicken Breast Fillets', packQuantity: 650, packUnit: 'g', price: 3.95 },
  { ingredientId: 'chicken-breast', name: 'Chicken Breast Family Pack', packQuantity: 1000, packUnit: 'g', price: 5.65 },
  { ingredientId: 'brown-rice', name: 'Brown Rice', packQuantity: 1000, packUnit: 'g', price: 1.35 },
  { ingredientId: 'broccoli', name: 'Broccoli', packQuantity: 500, packUnit: 'g', price: 0.85 },
  { ingredientId: 'lemon', name: 'Unwaxed Lemons', packQuantity: 4, packUnit: 'each', price: 0.95 },
  { ingredientId: 'tuna', name: 'Tuna Chunks in Spring Water', packQuantity: 290, packUnit: 'g', price: 2.0 },
  { ingredientId: 'butter-beans', name: 'Butter Beans', packQuantity: 240, packUnit: 'g', price: 0.55 },
  { ingredientId: 'tomatoes', name: 'Cherry Tomatoes', packQuantity: 300, packUnit: 'g', price: 0.95 },
  { ingredientId: 'turkey-mince', name: 'Lean Turkey Mince', packQuantity: 500, packUnit: 'g', price: 2.85 },
  { ingredientId: 'wholemeal-wraps', name: 'Wholemeal Wraps', packQuantity: 8, packUnit: 'each', price: 1.25 },
  { ingredientId: 'hummus', name: 'Reduced Fat Hummus', packQuantity: 200, packUnit: 'g', price: 0.85 },
  { ingredientId: 'peppers', name: 'Mixed Peppers', packQuantity: 3, packUnit: 'each', price: 1.25 },
  { ingredientId: 'peppers', name: 'Frozen Sliced Peppers', packQuantity: 500, packUnit: 'g', price: 1.4 },
  { ingredientId: 'lentils', name: 'Green Lentils', packQuantity: 250, packUnit: 'g', price: 0.65 },
  { ingredientId: 'courgette', name: 'Courgettes', packQuantity: 500, packUnit: 'g', price: 0.95 },
  { ingredientId: 'wholewheat-pasta', name: 'Wholewheat Pasta', packQuantity: 500, packUnit: 'g', price: 0.75 },
  { ingredientId: 'pesto', name: 'Green Pesto', packQuantity: 190, packUnit: 'g', price: 1.15 },
  { ingredientId: 'salmon', name: 'Salmon Fillets', packQuantity: 260, packUnit: 'g', price: 3.25 },
  { ingredientId: 'potatoes', name: 'Baby Potatoes', packQuantity: 1000, packUnit: 'g', price: 1.0 },
  { ingredientId: 'kidney-beans', name: 'Kidney Beans', packQuantity: 240, packUnit: 'g', price: 0.5 },
  { ingredientId: 'chopped-tomatoes', name: 'Chopped Tomatoes', packQuantity: 400, packUnit: 'g', price: 0.45 },
  { ingredientId: 'lean-beef', name: 'Lean Beef Stir Fry Strips', packQuantity: 300, packUnit: 'g', price: 3.2 },
  { ingredientId: 'wholewheat-noodles', name: 'Wholewheat Noodles', packQuantity: 250, packUnit: 'g', price: 1.0 },
  { ingredientId: 'stir-fry-veg', name: 'Stir Fry Vegetable Mix', packQuantity: 400, packUnit: 'g', price: 1.25 },
  { ingredientId: 'soy-sauce', name: 'Reduced Salt Soy Sauce', packQuantity: 150, packUnit: 'ml', price: 0.9 },
  { ingredientId: 'tofu', name: 'Firm Tofu', packQuantity: 400, packUnit: 'g', price: 1.75 },
  { ingredientId: 'chickpeas', name: 'Chickpeas', packQuantity: 240, packUnit: 'g', price: 0.5 },
  { ingredientId: 'light-coconut-milk', name: 'Light Coconut Milk', packQuantity: 400, packUnit: 'ml', price: 0.85 },
  { ingredientId: 'cod', name: 'Boneless Cod Fillets', packQuantity: 300, packUnit: 'g', price: 3.1 },
  { ingredientId: 'peas', name: 'Frozen Garden Peas', packQuantity: 900, packUnit: 'g', price: 1.2 },
];

const RETAILERS: readonly {
  id: RetailerId;
  name: string;
  priceFactor: number;
}[] = [
  { id: 'tesco', name: 'Tesco', priceFactor: 1 },
  { id: 'asda', name: 'Asda', priceFactor: 0.97 },
  { id: 'sainsburys', name: "Sainsbury's", priceFactor: 1.05 },
];

const money = (value: number): number => Math.round(value * 100) / 100;
const VALUE_RANGE_FACTOR = 0.72;

export const SEEDED_GROCERY_CATALOGUE: GroceryProduct[] = RETAILERS.flatMap(
  (retailer) =>
    PRODUCT_SEEDS.map((seed, index) => ({
      id: `${retailer.id}-${seed.ingredientId}-${index}`,
      retailerId: retailer.id,
      name: `${retailer.name} ${seed.name}`,
      ingredientId: seed.ingredientId,
      packQuantity: seed.packQuantity,
      packUnit: seed.packUnit,
      nutrition: seed.nutrition,
      offer: {
        price: money(seed.price * retailer.priceFactor * VALUE_RANGE_FACTOR),
        currency: 'GBP',
      },
    })),
);
