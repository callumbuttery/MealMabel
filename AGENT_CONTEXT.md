# MealMabel — agent context

Feed this file to other AI agents working on this repo. It is the current product and engineering state, not a wishlist. Prefer this over `AGENTS.md` when they disagree.

Today: 21 August 2026.

---

## What this product is

**MealMabel** is a UK-first weekly food and shopping assistant.

The user tells Mabel who they are feeding, the weekly budget, which meals they need, diet, allergens, goals, dislikes, and cooking effort. Mabel then:

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
- App Store Expo Go currently supports **Expo SDK 54**, not 57. This repo is aligned to SDK 54. Use https://docs.expo.dev/versions/v54.0.0/.
- After SDK or native-dep changes: `npx expo start -c`, then force-close Expo Go and scan a fresh QR. Tunnel if needed: `npx expo start -c --tunnel`. After copy/UI changes, a reload is often enough; if Expo Go looks stale, force-close it and scan a new QR.
- When custom native modules are required, use **EAS cloud development builds**, not a local Xcode install.
- **UK English only in product copy.** £ GBP, grams/kg, ml/litres. Say “shopping list”, “basket”, “coriander”, never grocery store / cart / cilantro.
- All user-facing strings live in `src/copy/index.ts`. Screens and components must use `copy.*` (and the format helpers in that module). Recipe names, day names, and catalogue product names may stay as fixture data.
- **Never put provider secrets in the client.** Flow is `app → MealMabel backend → AI / grocery providers`. Mocks today; real APIs later behind our own API.
- **Hard constraints must never be silently broken** to hit a budget or fill a seeded week: diet, allergens, excluded ingredients, and selected meal types. Soft goals (cost, protein, variety, time) are optimisation variables. The mock planner now refuses unsafe recipes (`NoSafePlanError`) rather than serving a seeded meal that breaks diet/allergens/dislikes. Catalogue products still do **not** have structured allergen data — recipe-level allergen notes are the current check.
- Do not redesign the product without a clear technical reason.

---

## Repo snapshot

- Path: this repository, React Native / Expo Router app.
- Branch: `main`. Work after the Expo template includes SDK 54 alignment, domain/mocks, MealMabel UI, onboarding-to-shop, then Ask Mabel, Compare My Shop, persisted create-plan inputs, product substitutions, constraint-safe generation, per-person diet/allergens, editable profile preferences, budget-impossible generating UX, pack-aware shopping list lines, analytics wiring, and (on the current working tree) soft-goal recipe ranking in the mock planner.
- Quality bar last known good: 51 Jest tests, `tsc --noEmit`, `expo lint && oxlint`, `oxfmt --check` (17 pre-existing unrelated files still fail format, unchanged from before this session).
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
  domain/        Models, household nutrition, allergens, constraints, aggregation, basket maths
  services/      Interfaces + mock implementations
  fixtures/      Seeded recipes, 7-day plan, Tesco/Asda/Sainsbury’s catalogue
  storage/       AsyncStorage app-state repository (swap-ready for Supabase later)
  analytics/     Logger abstraction (not wired into screens yet)
  features/      Household people form, diet chips, allergen chips
  __tests__/     Domain + copy + screen tests
```

Rules:

- UI talks to **service interfaces**, never to a supermarket or LLM vendor.
- Basket maths lives in `src/domain/basket-optimizer.ts`, not in screens. Cost is pack price × packs bought, never `required grams × unit price`.
- Ingredient aggregation lives in `src/domain/ingredients.ts`. One shopping-list line per ingredient for the week.
- Allergen expansion lives in `src/domain/allergens.ts` (UK 14 + restriction aliases such as `nut_free` → nuts/peanuts). Constraints and plan modifications use that helper; do not duplicate the mapping.
- Diet strictness lives in `src/domain/household.ts`: shared meals follow the **strictest** person diet. Create-plan cannot loosen it.
- Persisted app state is versioned (`@meal-mabel/app-state/v1`): onboarding, profile, current plan, checked shopping item IDs, optional `productSelections` (legacy v1 loads as `{}`).
- TanStack Query is used for shopping list + retailer comparison derived from the current plan. Product substitutions are part of the query key.

Mock planner behaviour (important): `MockMealPlanningService.generatePlan` validates the request, slices `SEEDED_WEEKLY_PLAN` by duration and meal types, scales servings to household size, then **replaces any seeded meal that fails hard constraints** with another safe recipe of that meal type. If a requested meal type has no safe recipe, it throws `NoSafePlanError`. The generating screen shows refusal UX and a “change your choices” path. Swap and Ask Mabel also keep diet/allergen/dislike constraints.

Soft optimisation: `src/domain/plan-optimizer.ts#rankRecipesForRequest` scores every hard-constraint-safe candidate for a meal slot against the household's `nutritionGoals` (`lower_calorie`, `high_protein`, `high_fibre`, `five_a_day` via a fruit/veg-ingredient heuristic, `cheapest_possible` via `estimateRecipeCostPerServing` in `basket-optimizer.ts`) and `cookingEffort === 'easy'`, using per-criterion min-max normalisation across that meal's candidates. **If no goals are set and effort isn't `easy`, every score is 0** and the stable sort leaves the seeded week's day-to-day variety untouched — `generatePlan` only swaps in `candidates[0]` (the single best match) once a soft preference is actually present. `maximumWeeklyBudget` and `cookingTimeLimitMinutes` are still stored but not yet used as planner inputs.

Typical household nutrition (used when generating a plan request):

- Adult typical: 2200 kcal / 55g protein / 30g fibre per day.
- Child typical: 1800 kcal / 42g protein / 20g fibre.
- Optional weight (kg) sizes typical calories/protein. Custom mode allows exact kcal / protein / fibre (e.g. 2500 / 180 / 30).
- Household totals are summed and written onto `PlanRequest.preferences` as daily calorie/protein/fibre targets.

---

## What is done

Polished mocked journey, runnable in Expo Go:

1. Welcome → household people (adults/children steppers, per-person cards with **diet** and **UK 14 allergens**, typical vs custom targets, optional weight) → preferences (household diet cannot loosen people, goals, person-allergen summary, restriction shortcuts, dislikes).
2. Tabs: Home, Plan, Shop, Profile.
3. Create plan: budget, diet (cannot loosen household), meals, days (3/5/7), cooking effort, Tesco/Asda/Sainsbury’s. Budget, effort, retailers and diet are persisted onto the plan request and profile.
4. Branded generating screen with rotating Mabel copy, retry on failure (~2.8s mock delay), and allergy/diet-safe refusal when no safe recipes exist.
5. Plan summary with recommended retailer. Home under/over-budget copy uses the saved weekly budget, not a hard-coded £60.
6. Weekly plan by day; meal cards and meal detail show **Contains …** allergen notes (or “No listed allergens”).
7. Swap meal (quick reasons) recalculates plan, shopping list, and baskets.
8. **Ask Mabel** (`src/app/ask-mabel.tsx`): suggestion chips + free text → `modifyPlan` → structured swap / servings / remove, then persist plan and invalidate `['plan-data']`. Parser: `src/services/mock-plan-modifications.ts`.
9. Aggregated shopping list with checkboxes that persist.
10. Retailer comparison and per-retailer basket breakdown. “Choose this product” persists via `productSelections` and recomputes that basket.
11. **Compare My Shop** (`src/app/compare-shop.tsx`): Home CTA opens this screen. Multiline list → mocked match → best overall + cheapest individual items. No multi-store routing.
12. Edit household from Profile (diet + allergens included); local reset.
13. **Edit preferences from Profile** (`src/app/edit-preferences.tsx`): diet (cannot loosen household), goals, dietary restrictions, dislikes, preferred supermarkets, all saved in place via `updatePreferences` — no full reset needed. Profile shows restrictions and the live preferred-retailer list.
14. **Budget-impossible generating UX**: after a plan generates, the generating screen waits for the retailer comparison and, if even the cheapest full shop is over the saved weekly budget, shows a “Here’s my best offer” insight (amount vs budget) with “See my week anyway” / “Change plan choices”, instead of silently proceeding.
15. **Pack-aware shopping list**: list rows show “Buy 2 × 500g packs” from the recommended retailer’s basket line when a pack match exists, falling back to “Needed: Xg” otherwise.
16. **Analytics wired** for `plan_generated`, `meal_swapped`, `plan_modified`, and `retailer_compared` (Shop tab compare switch + Compare My Shop) via a shared `analytics` singleton in `src/analytics/analytics.ts`. Still console-only (`AnalyticsLogger`), not sent anywhere.
17. **Soft-goal recipe ranking** (`src/domain/plan-optimizer.ts`): when a household sets `nutritionGoals` or `cookingEffort: 'easy'`, the planner now picks the best-scoring safe recipe for each meal slot (cheaper, higher protein, higher fibre, more veg/fruit portions, or quicker, depending on the goal) instead of always keeping the seeded recipe. No goals + non-`easy` effort still leaves the curated week untouched.

Also in place:

- Strict TypeScript domain models from the original spec, plus `AllergenId` and per-person `dietType` / `allergens`.
- Warm tokenised design system (cream, leafy green, coral).
- Reusable Mabel components (`MabelAvatar` is a placeholder, not emoji, ready to swap for artwork).
- Shared `DietChips` and `AllergenChips`.
- Copy module + screen tests that assert against `copy.*`.
- Tests for basket optimiser, constraints, ingredient aggregation, meal swap, plan modification, plan generation, plan/soft-goal optimiser, Compare My Shop, household targets, app-state (including product selections), copy, edit preferences, pack-aware shopping list, budget-impossible generating.

### MVP definition of done (from the original spec) — status

| Step | Status |
| --- | --- |
| Complete onboarding | Done |
| £60 budget, high protein, B/L/D, three retailers | Done in UI; budget/effort/diet persisted |
| Generate mocked 7-day plan | Done (seeded week, then constraint-safe replacements) |
| Browse days and open a recipe | Done, including allergen notes |
| Aggregated shopping list | Done |
| Basket cost at all three retailers + recommendation | Done |
| Swap a meal and see list/totals update | Done |
| Ask Mabel structured plan change | Done (mocked parser, not an LLM) |
| Compare My Shop freeform list | Done (mocked match) |
| Persistent product substitutions | Done |
| Close/reopen without losing the plan | Done (AsyncStorage) |

The slice is demoable enough to screen-record.

---

## What is outstanding

Ordered as the next useful work, not “everything ever”.

### In the original MVP spec, not finished

- **Profile after onboarding**: people, diet, goals, restrictions, dislikes and preferred supermarkets are all editable now. Still missing: favourite foods, account placeholders (email/sign out/delete) that do anything, Privacy/Terms screens.
- **Welcome “I already have an account”** is not a real account path (auth is explicitly later).
- **Error UX from the spec** is mostly there. Generation retry, allergy/diet-safe refusal, and budget-impossible (“best I could do £X”) all exist. Reduced-motion on generating is still incomplete.
- **Analytics events** are tracked for `plan_generated`, `meal_swapped`, `plan_modified`, `retailer_compared`. `onboarding_completed` and `shopping_item_checked` are defined in the union but not yet tracked.
- **Soft optimisation in generation**: `nutritionGoals` and `cookingEffort: 'easy'` now steer recipe choice per meal slot (see `plan-optimizer.ts` above). `maximumWeeklyBudget` and `cookingTimeLimitMinutes` still aren't planner inputs — there's no per-recipe budget allocation, and `cookingTimeLimitMinutes` is only enforced via `validateRecipeConstraints`/`COOKING_TIME`, not fed into ranking. Hard constraints (diet, allergens, dislikes, meal types) **are** enforced.

### Explicitly not MVP (do not build unless asked)

Receipt/barcode scanning, live supermarket APIs or scraping, Clubcard/Nectar, delivery/checkout, pantry, social/family sharing, recipe import, push, paywall, AI meal photos, Aldi/Lidl/Morrisons/Waitrose/Ocado, maps/multi-store routing, ML recommendations, marketing website.

Reserved future: receipt → reconstruct household shop → “you spent £X at Tesco; Mabel could get an equivalent for £Y at Asda.” Business model likely Free vs MealMabel+; do not hard-code “everything is free forever.”

### Next integrations (after the mocked slice is solid)

1. MealMabel backend; then swap mock services for API clients without rewriting screens.
2. Supabase for auth, PostgreSQL, saved plans, shopping history (keep `AppStateRepository` as the boundary).
3. Structured product allergen data — never trust an LLM as the only allergy check. Recipes already carry `allergens`; catalogue lines do not.
4. Real pack-aware catalogue and planner that uses household nutrition + budget as inputs, not only the seeded week plus constraint filters.
5. Final Mabel mascot artwork replacing `MabelAvatar`.
6. npm audit: transitive Expo/Jest advisories were reported and not patched.

### Known leftover / tidy-up

- Template leftovers may remain (`scripts/reset-project.js`, some Expo template packages in `package.json` such as `@expo/ui`, `expo-glass-effect`).
- Duplicate service names (`GroceryCatalogueService` / `GroceryCatalogService`) from the spec; keep behaviour, consider consolidating carefully.

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

The previous milestone (editable profile preferences, budget-impossible generating UX, pack-aware shopping list lines, core analytics events, soft-goal recipe ranking) is done. If continuing from this file with no further instruction, implement:

1. Account placeholders that do something real: show the demo email, a working “Sign out” and “Delete account” (both local-only, since auth doesn't exist yet — reuse the reset flow with distinct, honest copy) and simple Privacy/Terms screens (static content is fine).
2. Track the remaining high-value analytics events already in the union: `onboarding_completed` (finish of preferences screen) and `shopping_item_checked` (Shop tab checkbox toggle).
3. Reduced-motion support on the generating screen (respect `useReducedMotion` / `AccessibilityInfo.isReduceMotionEnabled`, skip the rotating Mabel copy animation).
4. Extend `plan-optimizer.ts` to factor in `maximumWeeklyBudget` (e.g. weight `estimateRecipeCostPerServing` more heavily, or hard-cap candidates once a running weekly total would exceed budget) and `cookingTimeLimitMinutes` as a soft ranking input alongside the existing `cookingEffort: 'easy'` signal.

Keep mocks. Do not add live APIs, Supabase, or a marketing site unless explicitly asked.
