import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { useMealMabelApp } from '@/app-state/app-provider';
import {
  AppHeader,
  AppText,
  AppTextInput,
  Card,
  ChoiceChip,
  MabelInsight,
  PrimaryButton,
  Screen,
  SecondaryButton,
} from '@/components';
import { copy } from '@/copy';
import type { MockPlanModificationDraft, MockPlanModificationFailure } from '@/services';
import { spacing } from '@/theme';

type SuccessfulModification = Extract<MockPlanModificationDraft, { ok: true }>;

function failureCopy(reason: MockPlanModificationFailure): string {
  if (reason === 'no-safe-match') return copy.askMabel.noSafeMatch;
  if (reason === 'no-better-match') return copy.askMabel.noBetterMatch;
  if (reason === 'meal-not-found') return copy.askMabel.missing;
  return copy.askMabel.unsupported;
}

function successCopy(result: SuccessfulModification): string {
  if (result.kind === 'remove') {
    return copy.askMabel.removed(result.previousRecipeName);
  }
  if (result.kind === 'servings') {
    return copy.askMabel.servingsChanged(result.previousRecipeName, result.servings ?? 1);
  }
  return copy.askMabel.swapped(
    result.previousRecipeName,
    result.nextRecipeName ?? result.previousRecipeName,
  );
}

export default function AskMabelScreen() {
  const { mealId } = useLocalSearchParams<{ mealId: string }>();
  const { state, modifyPlan } = useMealMabelApp();
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>();
  const [result, setResult] = useState<SuccessfulModification>();

  if (result) {
    return (
      <Screen>
        <AppHeader title={copy.askMabel.title} onBack={() => router.back()} />
        <MabelInsight title={copy.askMabel.successTitle}>{successCopy(result)}</MabelInsight>
        <PrimaryButton
          label={copy.askMabel.seePlan}
          onPress={() => router.replace('/(tabs)/plan')}
        />
        {result.kind !== 'remove' ? (
          <SecondaryButton
            label={copy.askMabel.anotherChange}
            onPress={() => {
              setMessage('');
              setResult(undefined);
            }}
          />
        ) : null}
      </Screen>
    );
  }

  const match = state.currentPlan?.days
    .flatMap((day) => day.meals.map((meal) => ({ day, meal })))
    .find(({ meal }) => meal.id === mealId);

  if (!match) {
    return (
      <Screen>
        <AppHeader title={copy.askMabel.title} onBack={() => router.back()} />
        <MabelInsight>{copy.askMabel.missing}</MabelInsight>
      </Screen>
    );
  }

  const submit = async () => {
    setSaving(true);
    setError(undefined);
    try {
      const outcome = await modifyPlan(match.meal.id, message);
      if (outcome.ok) {
        setResult(outcome);
      } else {
        setError(failureCopy(outcome.reason));
      }
    } catch {
      setError(copy.askMabel.failed);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen>
      <AppHeader
        title={copy.askMabel.title}
        subtitle={copy.askMabel.subtitle(match.day.dayName, copy.mealTypes[match.meal.type])}
        onBack={() => router.back()}
      />
      <Card style={styles.meal}>
        <AppText variant="caption" tone="muted">
          {copy.mealTypes[match.meal.type]}
        </AppText>
        <AppText variant="h2">{match.meal.recipe.name}</AppText>
      </Card>
      <MabelInsight title={copy.askMabel.insightTitle}>{copy.askMabel.insightBody}</MabelInsight>
      <View style={styles.chips}>
        {copy.askMabel.suggestions.map((suggestion) => (
          <ChoiceChip
            key={suggestion}
            label={suggestion}
            selected={message === suggestion}
            disabled={saving}
            onPress={() => {
              setMessage(suggestion);
              setError(undefined);
            }}
          />
        ))}
      </View>
      <AppTextInput
        label={copy.askMabel.requestLabel}
        placeholder={copy.askMabel.requestPlaceholder}
        value={message}
        onChangeText={(value) => {
          setMessage(value);
          setError(undefined);
        }}
        error={error}
        editable={!saving}
        multiline
        style={styles.input}
      />
      <PrimaryButton
        label={copy.askMabel.updateCta}
        loading={saving}
        disabled={!message.trim()}
        onPress={() => void submit()}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  meal: { gap: spacing.xs },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  input: { minHeight: 112, textAlignVertical: 'top' },
});
