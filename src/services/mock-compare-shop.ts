import { compareRetailers } from '@/domain/basket-optimizer';
import type {
  CompareShopMatchedItem,
  CompareShopResult,
  GroceryProduct,
  IngredientUnit,
} from '@/domain/models';
import { SEEDED_GROCERY_CATALOGUE } from '@/fixtures/catalogue';
import type { CompareShopService } from '@/services/interfaces';

const INGREDIENT_ALIASES: Record<string, string[]> = {
  oats: ['oats', 'porridge oats'],
  'greek-yoghurt': ['greek yoghurt', 'greek yogurt', 'yoghurt', 'yogurt'],
  berries: ['mixed berries', 'frozen berries', 'berries'],
  'peanut-butter': ['peanut butter'],
  eggs: ['free range eggs', 'eggs', 'egg'],
  spinach: ['baby spinach', 'spinach'],
  'cottage-cheese': ['cottage cheese'],
  'seeded-bread': ['seeded bread', 'wholemeal bread', 'bread', 'loaf'],
  banana: ['bananas', 'banana'],
  'chicken-breast': ['chicken breasts', 'chicken breast', 'chicken'],
  'brown-rice': ['brown rice', 'rice'],
  broccoli: ['broccoli'],
  lemon: ['lemons', 'lemon'],
  tuna: ['tuna chunks', 'tuna'],
  'butter-beans': ['butter beans'],
  tomatoes: ['cherry tomatoes'],
  'turkey-mince': ['turkey mince', 'turkey'],
  'wholemeal-wraps': ['wholemeal wraps', 'wraps', 'wrap'],
  hummus: ['hummus'],
  peppers: ['mixed peppers', 'peppers', 'pepper'],
  lentils: ['green lentils', 'lentils'],
  courgette: ['courgettes', 'courgette'],
  'wholewheat-pasta': ['wholewheat pasta', 'wholemeal pasta', 'pasta'],
  pesto: ['green pesto', 'pesto'],
  salmon: ['salmon fillets', 'salmon'],
  potatoes: ['baby potatoes', 'potatoes', 'potato'],
  'kidney-beans': ['kidney beans'],
  'chopped-tomatoes': ['chopped tomatoes', 'tinned tomatoes'],
  'lean-beef': ['beef strips', 'lean beef', 'beef'],
  'wholewheat-noodles': ['wholewheat noodles', 'noodles'],
  'stir-fry-veg': ['stir fry vegetables', 'stir fry veg'],
  'soy-sauce': ['soy sauce'],
  tofu: ['firm tofu', 'tofu'],
  chickpeas: ['chickpeas'],
  'light-coconut-milk': ['light coconut milk', 'coconut milk'],
  cod: ['cod fillets', 'cod'],
  peas: ['garden peas', 'frozen peas', 'peas'],
};

const ALIAS_ENTRIES = Object.entries(INGREDIENT_ALIASES)
  .flatMap(([ingredientId, aliases]) => aliases.map((alias) => ({ ingredientId, alias })))
  .sort((left, right) => right.alias.length - left.alias.length);

const DEFINITIONS = new Map<string, GroceryProduct>();
for (const product of SEEDED_GROCERY_CATALOGUE) {
  if (!DEFINITIONS.has(product.ingredientId)) {
    DEFINITIONS.set(product.ingredientId, product);
  }
}

function wait(delayMs: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, delayMs));
}

function normalise(value: string): string {
  return value
    .toLowerCase()
    .replace(/[’']/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function genericName(product: GroceryProduct): string {
  return product.name.replace(/^(Tesco|Asda|Sainsbury's)\s+/i, '');
}

function baseQuantity(
  quantity: number,
  unit: IngredientUnit,
): {
  quantity: number;
  unit: IngredientUnit;
} {
  if (unit === 'kg') return { quantity: quantity * 1000, unit: 'g' };
  if (unit === 'l') return { quantity: quantity * 1000, unit: 'ml' };
  return { quantity, unit };
}

function findIngredientId(query: string): string | null {
  const normalised = normalise(query);
  const match = ALIAS_ENTRIES.find(
    ({ alias }) =>
      normalised === alias ||
      normalised.startsWith(`${alias} `) ||
      normalised.endsWith(` ${alias}`) ||
      normalised.includes(` ${alias} `),
  );
  return match?.ingredientId ?? null;
}

function parseLine(rawLine: string): Omit<CompareShopMatchedItem, 'inputLines'> | null {
  const inputLine = rawLine.replace(/^[\s•*\-–—]+/, '').trim();
  if (!inputLine) return null;

  let remainder = inputLine;
  let packMultiplier: number | undefined;
  const packMatch = remainder.match(/^(\d+)\s*[x×]\s*(.+)$/i);
  if (packMatch) {
    packMultiplier = Number(packMatch[1]);
    remainder = packMatch[2];
  }

  let amount: number | undefined;
  let unit: IngredientUnit | undefined;
  const amountMatch = remainder.match(/^(\d+(?:\.\d+)?)\s*(kg|g|ml|l|each)\b\s*(?:of\s+)?(.+)$/i);
  if (amountMatch) {
    amount = Number(amountMatch[1]);
    unit = amountMatch[2].toLowerCase() as IngredientUnit;
    remainder = amountMatch[3];
  }

  let count: number | undefined;
  if (amount === undefined && packMultiplier === undefined) {
    const countMatch = remainder.match(/^(\d+)\s+(.+)$/);
    if (countMatch) {
      count = Number(countMatch[1]);
      remainder = countMatch[2];
    }
  }

  const ingredientId = findIngredientId(remainder);
  if (!ingredientId) return null;
  const definition = DEFINITIONS.get(ingredientId);
  if (!definition) return null;

  const pack = baseQuantity(definition.packQuantity, definition.packUnit);
  let requirement =
    amount !== undefined && unit
      ? baseQuantity(amount * (packMultiplier ?? 1), unit)
      : {
          quantity:
            definition.packUnit === 'each' && count !== undefined
              ? count
              : pack.quantity * (count ?? packMultiplier ?? 1),
          unit: pack.unit,
        };
  if (requirement.unit !== pack.unit) return null;

  requirement = {
    quantity: Math.max(requirement.quantity, 0.01),
    unit: requirement.unit,
  };
  return {
    ingredientId,
    name: genericName(definition),
    quantity: requirement.quantity,
    unit: requirement.unit,
  };
}

function parseList(input: string): {
  matchedItems: CompareShopMatchedItem[];
  unmatchedLines: string[];
} {
  const matched = new Map<string, CompareShopMatchedItem>();
  const unmatchedLines: string[] = [];

  for (const rawLine of input.split(/\r?\n/)) {
    const inputLine = rawLine.replace(/^[\s•*\-–—]+/, '').trim();
    if (!inputLine) continue;
    const item = parseLine(inputLine);
    if (!item) {
      unmatchedLines.push(inputLine);
      continue;
    }
    const existing = matched.get(item.ingredientId);
    if (existing && existing.unit === item.unit) {
      matched.set(item.ingredientId, {
        ...existing,
        quantity: existing.quantity + item.quantity,
        inputLines: [...existing.inputLines, inputLine],
      });
    } else {
      matched.set(item.ingredientId, { ...item, inputLines: [inputLine] });
    }
  }

  return { matchedItems: [...matched.values()], unmatchedLines };
}

export interface MockCompareShopOptions {
  delayMs?: number;
}

export class MockCompareShopService implements CompareShopService {
  public constructor(private readonly options: MockCompareShopOptions = {}) {}

  public async compareList(input: string): Promise<CompareShopResult> {
    await wait(this.options.delayMs ?? 450);
    const { matchedItems, unmatchedLines } = parseList(input);
    return {
      matchedItems,
      unmatchedLines,
      comparison: compareRetailers(
        matchedItems.map(({ inputLines: _inputLines, ...requirement }) => requirement),
        SEEDED_GROCERY_CATALOGUE,
      ),
    };
  }
}
