# MealMabel

MealMabel is a UK-first weekly food and shopping assistant. Tell Mabel who you are feeding, the budget, and your preferences, and she plans the week down to an aggregated shopping list and Tesco / Asda / Sainsbury’s comparison.

This repo is the React Native mobile app. The first build uses mocked services so you can validate the product experience without live supermarket APIs, LLMs, or production auth.

## Requirements

- Node.js 20 or later
- npm
- [Expo Go](https://expo.dev/go) on a physical iPhone or Android phone

The App Store version of Expo Go currently supports **Expo SDK 54**. This project is aligned to that SDK so you can develop without Xcode or the iOS Simulator.

When custom native modules are required, use EAS cloud development builds rather than a local Xcode install.

## Setup

```bash
npm install
```

## Run on a physical phone

1. Install Expo Go from the App Store or Google Play.
2. Connect the phone and computer to the same Wi-Fi network.
3. Start the app:

```bash
npm start
```

4. Scan the QR code with the iPhone Camera app, or from Expo Go on Android.
5. If the phone cannot reach Metro, use a tunnel:

```bash
npx expo start -c --tunnel
```

Force-close and reopen Expo Go after a SDK or dependency change, then scan a fresh QR code.

## Scripts

| Command | What it does |
| --- | --- |
| `npm start` | Start Expo / Metro |
| `npm test` | Run Jest tests |
| `npm run typecheck` | Strict TypeScript check |
| `npm run lint` | Expo ESLint and Oxlint |
| `npm run format` | Format the repo with Oxfmt |
| `npm run format:check` | Check formatting without writing files |

Copy for test and quality checks:

```bash
npm test
npm run typecheck
npm run lint
npm run format:check
```

Run everything together:

```bash
npm test && npm run typecheck && npm run lint
```

## Product slice

The mocked vertical slice covers:

1. Onboarding
2. Household people, including typical vs custom nutrition targets
3. Plan my week
4. Branded generation
5. Weekly meal plan and recipe detail
6. Meal swap
7. Aggregated shopping list
8. Supermarket comparison and retailer baskets

Checked shopping items, onboarding, household members, and the current plan persist locally.

## Architecture

UI screens talk to service interfaces, not supermarket or AI providers. Initial implementations are mocks over fixture data and pack-aware basket maths.

```
src/
  app/           Expo Router screens
  copy/          All user-facing copy
  components/    Shared UI
  domain/        Models and optimisation
  services/      Interfaces and mocks
  fixtures/      Demo recipes, plan, catalogue
  storage/       Local persistence
  theme/         Design tokens
```

Replacing a mock service later should not require rewriting screens. Product copy lives in `src/copy/index.ts` so screens stay free of hardcoded user-facing strings. Secrets must not live in the client; a MealMabel backend will sit in front of AI and grocery providers.

## Notes

- Currency is £ GBP. Units are grams, kilograms, millilitres and litres.
- Do not treat the mock planner as allergy-safe. Hard dietary restrictions must eventually be checked against structured product data.
- The marketing site at mealmabel.co.uk is a separate project.
