# MealMabel — agent context

Feed this file to other AI agents working on this repo. It is the current product and engineering state, not a wishlist. Prefer this over `AGENTS.md` when they disagree.

Today: 16 August 2026.

---

## What this product is

**MealMabel** is a UK-first weekly food and shopping assistant.

The user tells Mabel who they are feeding, the weekly budget, which meals they need, diet, goals, dislikes, and cooking effort. Mabel then:

1. Plans the week’s meals.
2. Reuses ingredients to reduce waste.
3. Aggregates groceries across the week (not per recipe).
4. Maps those ingredients to real supermarket packs.
5. Compares Tesco, Asda and Sainsbury’s baskets.
6. Recommends the cheapest/best-value shop.
7. Lets the user swap meals or ask Mabel to change the plan, then recalculates the list and baskets.

The app should feel like Mabel has done the tedious work. Warm, effortless, useful. Not a calorie tracker, chatbot, supermarket website, or children’s character.

**Primary product:** native iOS/Android app.  
**Not this repo:** marketing site at mealmabel.co.uk (waitlist, screenshots, legal). Do not build it here.

The first milestone is a **polished mocked vertical slice**. Do not block on live supermarket APIs, LLMs, or production auth. Those come after the experience is validated.

---

## Hard constraints for agents

- **Expo Go on a physical iPhone is the development target.** The primary machine cannot rely on current Xcode or the iOS Simulator.
- App Store Expo Go currently supports **Expo SDK 54**, not 57. This repo is aligned to SDK 54. Ignore `AGENTS.md` if it still points at `docs.expo.dev/versions/v57.0.0/`. Use https://docs.expo.dev/versions/v54.0.0/.
- After SDK or native-dep changes: `npx expo start -c`, then force-close Expo Go and scan a fresh QR. Tunnel if needed: `npx expo start -c --tunnel`.
- When custom native modules are required, use **EAS cloud development builds**, not a local Xcode install.
- **UK English only in product copy.** £ GBP, grams/kg, ml/litres. Say “shopping list”, “basket”, “coriander”, never grocery store / cart / cilantro.
- All user-facing strings live in `src/copy/index.ts`. Screens and components must use `copy.*` (and the format helpers in that module). Recipe names, day names, and catalogue product names may stay as fixture data.
- **Never put provider secrets in the client.** Flow is `app → MealMabel backend → AI / grocery providers`. Mocks today; real APIs later behind our own API.
- Do not treat the mock planner as allergy-safe. Hard restrictions (allergies, vegan/vegetarian, selected meal types) must never be silently broken to hit a budget. Soft goals (cost, protein, variety, time) are optimisation variables.
- Do not redesign the product without a clear technical reason.

---

## Repo snapshot

- Path: this repository, React Native / Expo Router app.
- Branch: `main`. Recent work is split into five commits after the Expo template:

  1. Align to Expo SDK 54, Expo Go, Oxfmt/Oxlint/ESLint/Jest.
  2. Domain models, copy, fixtures, mock services, persistence, unit tests.
  3. MealMabel theme and components; Expo template UI removed.
  4. Onboarding-to-shop screens, household nutrition, TanStack Query shopping/comparison, screen tests.
  5. README rewrite.

- Quality bar last known good: Jest tests, `tsc --noEmit`, `expo lint && oxlint`.
- Formatting: **Oxfmt**, not Prettier. Config: `.oxfmtrc.json`.
- Do not commit `.env`, secrets, `dist-smoke/`, `.expo`, `ios/`, `android/`.

Run:

```bash
npm install
npm start
npm test && npm run typecheck && npm run lint && npm run format:check
```

---

## Architecture

```
src/
  app/           Expo Router screens
  app-state/     Persistence + plan generation + query wiring
  copy/          All user-facing copy
  components/    Shared UI (MabelAvatar, buttons, sheets, cards, …)
  theme/         Design tokens (colour, space, type, radius)
  domain/        Models, household nutrition, constraints, aggregation, basket maths
  services/      Interfaces + mock implementations
  fixtures/      Seeded recipes, 7-day plan, Tesco/Asda/Sainsbury’s catalogue
  storage/       AsyncStorage app-state repository (swap-ready for Supabase later)
  analytics/     Logger abstraction (not wired into screens yet)
  features/      Household people form
  __tests__/     Domain + copy + screen tests
```

Rules:

- UI talks to **service interfaces**, never to a supermarket or LLM vendor.
- Basket maths lives in `src/domain/basket-optimizer.ts`, not in screens. Cost is pack price × packs bought, never `required grams × unit price`.
- Ingredient aggregation lives in `src/domain/ingredients.ts`. One shopping-list line per ingredient for the week.
- Persisted app state is versioned (`@meal-mabel/app-state/v1`): onboarding, profile, current plan, checked shopping item IDs.
- TanStack Query is used for shopping list + retailer comparison derived from the current plan.

Mock planner behaviour (important): `MockMealPlanningService.generatePlan` validates the request, then returns a **sliced copy of `SEEDED_WEEKLY_PLAN`**. It filters by duration and meal types and scales servings to household size. It does **not** currently generate meals from nutrition targets, budget, effort, or dislikes. Swap picks another seeded recipe of the same meal type. Shopping and comparison **do** run real domain functions over the fixture catalogue.

Typical household nutrition (used when generating a plan request):

- Adult typical: 2200 kcal / 55g protein / 30g fibre per day.
- Child typical: 1800 kcal / 42g protein / 20g fibre.
- Optional weight (kg) sizes typical calories/protein. Custom mode allows exact kcal / protein / fibre (e.g. 2500 / 180 / 30).
- Household totals are summed and written onto `PlanRequest.preferences` as daily calorie/protein/fibre targets.

---

## What is done

Polished mocked journey, runnable in Expo Go:

1. Welcome → household people (adults/children steppers, per-person cards, typical vs custom targets, optional weight) → preferences (diet, goals, restrictions, dislikes).
2. Tabs: Home, Plan, Shop, Profile.
3. Create plan: budget, meals, days (3/5/7), cooking effort, Tesco/Asda/Sainsbury’s.
4. Branded generating screen with rotating Mabel copy and retry on failure (~2.8s mock delay).
5. Plan summary with recommended retailer.
6. Weekly plan by day; meal detail with ingredients and method.
7. Swap meal (quick reasons + free text) recalculates plan, shopping list, and baskets.
8. Aggregated shopping list with checkboxes that persist.
9. Retailer comparison and per-retailer basket breakdown.
10. Edit household from Profile; local reset.

Also in place:

- Strict TypeScript domain models from the original spec.
- Warm tokenised design system (cream, leafy green, coral).
- Reusable Mabel components (`MabelAvatar` is a placeholder, not emoji, ready to swap for artwork).
- Copy module + screen tests that assert against `copy.*`.
- Tests for basket optimiser, constraints, ingredient aggregation, meal swap, household targets, copy.

### MVP definition of done (from the original spec) — status

| Step | Status |
| --- | --- |
| Complete onboarding | Done |
| £60 budget, high protein, B/L/D, three retailers | Done in UI |
| Generate mocked 7-day plan | Done (seeded plan, not a real optimiser) |
| Browse days and open a recipe | Done |
| Aggregated shopping list | Done |
| Basket cost at all three retailers + recommendation | Done |
| Swap a meal and see list/totals update | Done |
| Close/reopen without losing the plan | Done (AsyncStorage) |

The slice is demoable enough to screen-record.

---

## What is outstanding

Ordered as the next useful work, not “everything ever”.

### In the original MVP spec, not finished

- **Compare My Shop** as a freeform list (`src/app/compare-shop.tsx`). Home still has the card, but the CTA currently opens the Shop tab. Spec: multiline list → mocked match → best overall + cheapest individual items. No multi-store route optimisation.
- **Ask Mabel** as a real plan-modification flow. Meal detail has a sheet, but it calls `swapMeal` with the user’s sentence. `MealPlanningService.modifyPlan` exists and is unused by UI. Needs structured updates (not a ChatGPT clone). Spec wanted suggestion chips and a dedicated `ask-mabel` screen.
- **Persistent product substitutions.** Retailer basket “Choose another product” shows 2–3 catalogue alternatives, then closes without changing the basket.
- **Create-plan inputs not fully applied.** Cooking effort is selected but not saved onto the plan request. The mock planner ignores budget, goals, effort, and dislikes except basic request validation. Home “under budget” copy hard-codes £60 instead of the user’s budget.
- **Profile after onboarding** is mostly read-only. Missing editable diet/goals/restrictions/dislikes, favourite foods, preferred supermarkets, account placeholders (email/sign out/delete) that do anything, Privacy/Terms screens.
- **Welcome “I already have an account”** is not a real account path (auth is explicitly later).
- **Error UX from the spec** is only partly there. Generation retry exists. Budget-impossible (“best I could do £X”), allergy-safe refusal UX, and reduced-motion on generating are incomplete.
- **Analytics events** are defined in `src/analytics/analytics.ts` but **never tracked** from the app. Spec list is wider than the current event union.
- **Shopping list line display** shows needed quantity, not “buy 1 × 650g pack”. Pack mapping lives on the retailer basket.
- **Hard constraint enforcement in generation** is incomplete: onboarding restrictions/dislikes are stored, `validateRecipeConstraints` exists, but the seeded planner still serves the same demo week.

### Explicitly not MVP (do not build unless asked)

Receipt/barcode scanning, live supermarket APIs or scraping, Clubcard/Nectar, delivery/checkout, pantry, social/family sharing, recipe import, push, paywall, AI meal photos, Aldi/Lidl/Morrisons/Waitrose/Ocado, maps/multi-store routing, ML recommendations, marketing website.

Reserved future: receipt → reconstruct household shop → “you spent £X at Tesco; Mabel could get an equivalent for £Y at Asda.” Business model likely Free vs MealMabel+; do not hard-code “everything is free forever.”

### Next integrations (after the mocked slice is solid)

1. Conversational plan modifications that actually change the week and recompute baskets.
2. Freeform Compare My Shop.
3. MealMabel backend; then swap mock services for API clients without rewriting screens.
4. Supabase for auth, PostgreSQL, saved plans, shopping history (keep `AppStateRepository` as the boundary).
5. Structured product allergen data — never trust an LLM as the only allergy check.
6. Real pack-aware catalogue and planner that uses household nutrition + budget as inputs, not only the seeded week.
7. Final Mabel mascot artwork replacing `MabelAvatar`.
8. npm audit: transitive Expo/Jest advisories were reported and not patched.

### Known leftover / tidy-up

- `AGENTS.md` still says Expo 57. Fix it when next touching docs; until then more recent Expo versioned docs for **SDK 54**.
- Template leftovers may remain (`scripts/reset-project.js`, some Expo template packages in `package.json` such as `@expo/ui`, `expo-glass-effect`).
- Duplicate service names (`GroceryCatalogueService` / `GroceryCatalogService`) from the spec; keep behaviour, consider consolidating carefully.
- Home compare CTA and budget copy mismatches listed above.

---

## Product principles (do not drop)

- **Friendly** — Mabel is approachable, not pretending to be human. Voice: short, warm, specific (“Asda saves you £6.18 this week”). Avoid emoji floods, exclamation marks, childish copy.
- **Effortless** — first plan in about a minute. No 10-screen questionnaire.
- **Useful** — mascot never beats information clarity.
- **Grounded** — prices, nutrition, and quantities from structured data / functions, not LLM arithmetic.
- **UK-first** — currency, units, supermarket names, food words.

Design: modern consumer food/lifestyle. Warm cream background, leafy green primary, muted tomato accent, soft sage, near-black text. Rounded cards, little shadow, strong type hierarchy. WCAG-sensible contrast. Tokens in `src/theme`, not magic numbers in screens.

Mabel should appear on onboarding, generating, insights, empty states, conversational edits — not on every row.

---

## Suggested next milestone

If continuing from this file with no further instruction, implement:

1. Wire `modifyPlan` (and a proper Ask Mabel surface) so free-text/chips produce a structured plan change and basket refresh.
2. Build Compare My Shop as its own mocked journey.
3. Stop hard-coding £60 on Home; persist create-plan effort/budget into the request and comparison copy.
4. Make “Choose another product” persist and recompute that retailer’s basket.

Keep mocks. Do not add live APIs, Supabase, or a marketing site unless explicitly asked.
