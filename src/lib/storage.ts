import { initialState, sanitizeState, type State } from '../state/reducer';
export const STORAGE_KEY = 'bright-side:v1';
export interface StorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}
export function readStorage(storage: StorageAdapter): { state: State; warning: string } {
  try {
    const data = storage.getItem(STORAGE_KEY);
    return { state: data ? sanitizeState(JSON.parse(data)) : initialState(), warning: '' };
  } catch {
    return {
      state: initialState(),
      warning: 'Saved data could not be read. You can keep browsing; this session starts fresh.',
    };
  }
}
export function writeStorage(storage: StorageAdapter, state: State) {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}
