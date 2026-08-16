import AsyncStorage from '@react-native-async-storage/async-storage';

import type { UserProfile, WeeklyPlan } from '@/domain/models';

export interface KeyValueStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

export interface PersistedAppState {
  version: 1;
  onboardingComplete: boolean;
  profile: UserProfile | null;
  currentPlan: WeeklyPlan | null;
  checkedShoppingItemIds: string[];
}

export const EMPTY_APP_STATE: PersistedAppState = {
  version: 1,
  onboardingComplete: false,
  profile: null,
  currentPlan: null,
  checkedShoppingItemIds: [],
};

const APP_STATE_KEY = '@meal-mabel/app-state/v1';

export class AsyncStorageAdapter implements KeyValueStorage {
  public getItem(key: string): Promise<string | null> {
    return AsyncStorage.getItem(key);
  }

  public setItem(key: string, value: string): Promise<void> {
    return AsyncStorage.setItem(key, value);
  }

  public removeItem(key: string): Promise<void> {
    return AsyncStorage.removeItem(key);
  }
}

export class AppStateRepository {
  public constructor(
    private readonly storage: KeyValueStorage = new AsyncStorageAdapter(),
  ) {}

  public async load(): Promise<PersistedAppState> {
    const serialized = await this.storage.getItem(APP_STATE_KEY);
    if (!serialized) {
      return { ...EMPTY_APP_STATE };
    }

    const parsed: unknown = JSON.parse(serialized);
    if (!isPersistedAppState(parsed)) {
      throw new Error('Stored app state has an unsupported shape.');
    }
    return parsed;
  }

  public async save(state: PersistedAppState): Promise<void> {
    await this.storage.setItem(APP_STATE_KEY, JSON.stringify(state));
  }

  public async setOnboardingComplete(complete: boolean): Promise<void> {
    await this.patch({ onboardingComplete: complete });
  }

  public async setProfile(profile: UserProfile | null): Promise<void> {
    await this.patch({ profile });
  }

  public async setCurrentPlan(currentPlan: WeeklyPlan | null): Promise<void> {
    await this.patch({ currentPlan, checkedShoppingItemIds: [] });
  }

  public async setShoppingItemChecked(
    itemId: string,
    checked: boolean,
  ): Promise<void> {
    const state = await this.load();
    const ids = new Set(state.checkedShoppingItemIds);
    if (checked) {
      ids.add(itemId);
    } else {
      ids.delete(itemId);
    }
    await this.save({ ...state, checkedShoppingItemIds: [...ids] });
  }

  public async clear(): Promise<void> {
    await this.storage.removeItem(APP_STATE_KEY);
  }

  private async patch(
    patch: Partial<Omit<PersistedAppState, 'version'>>,
  ): Promise<void> {
    const state = await this.load();
    await this.save({ ...state, ...patch, version: 1 });
  }
}

function isPersistedAppState(value: unknown): value is PersistedAppState {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    candidate.version === 1 &&
    typeof candidate.onboardingComplete === 'boolean' &&
    (candidate.profile === null || typeof candidate.profile === 'object') &&
    (candidate.currentPlan === null || typeof candidate.currentPlan === 'object') &&
    Array.isArray(candidate.checkedShoppingItemIds) &&
    candidate.checkedShoppingItemIds.every((id) => typeof id === 'string')
  );
}
