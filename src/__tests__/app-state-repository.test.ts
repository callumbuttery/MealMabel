import { describe, expect, it, jest } from '@jest/globals';

import { productSelectionKey } from '@/domain';
import { AppStateRepository, EMPTY_APP_STATE, type KeyValueStorage } from '@/storage';

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  },
}));

class MemoryStorage implements KeyValueStorage {
  private value: string | null = null;

  public async getItem(): Promise<string | null> {
    return this.value;
  }

  public async setItem(_key: string, value: string): Promise<void> {
    this.value = value;
  }

  public async removeItem(): Promise<void> {
    this.value = null;
  }
}

describe('AppStateRepository product selections', () => {
  it('persists a selected retailer product', async () => {
    const repository = new AppStateRepository(new MemoryStorage());
    const key = productSelectionKey('tesco', 'chicken-breast');
    await repository.save({
      ...EMPTY_APP_STATE,
      productSelections: { [key]: 'tesco-chicken-small' },
    });

    await expect(repository.load()).resolves.toMatchObject({
      productSelections: { [key]: 'tesco-chicken-small' },
    });
  });

  it('loads older v1 state with an empty product selection map', async () => {
    const storage = new MemoryStorage();
    const repository = new AppStateRepository(storage);
    const { productSelections: _selections, ...legacyState } = EMPTY_APP_STATE;
    await storage.setItem('ignored', JSON.stringify(legacyState));

    await expect(repository.load()).resolves.toMatchObject({
      productSelections: {},
    });
  });

  it('persists a mocked sign-in account', async () => {
    const repository = new AppStateRepository(new MemoryStorage());
    await repository.save({
      ...EMPTY_APP_STATE,
      account: {
        provider: 'google',
        identifier: 'demo@example.com',
        displayName: 'Demo',
        createdAt: '2026-08-01T00:00:00.000Z',
      },
    });

    await expect(repository.load()).resolves.toMatchObject({
      account: { provider: 'google', identifier: 'demo@example.com' },
    });
  });

  it('loads older state without an account field as signed out', async () => {
    const storage = new MemoryStorage();
    const repository = new AppStateRepository(storage);
    const { account: _account, ...legacyState } = EMPTY_APP_STATE;
    await storage.setItem('ignored', JSON.stringify(legacyState));

    await expect(repository.load()).resolves.toMatchObject({ account: null });
  });
});
