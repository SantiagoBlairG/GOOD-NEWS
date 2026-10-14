import { describe, it, expect } from 'vitest';
import { initialState, reducer, sanitizeState } from '../state/reducer';
import { readStorage, writeStorage } from '../lib/storage';
import { stories } from '../lib/repository';
const at = '2026-10-14T12:00:00Z';
describe('deck state', () => {
  it('saves idempotently and ignores duplicate deck commits', () => {
    const initial = initialState();
    const action = { type: 'advance' as const, kind: 'save' as const, id: initial.batch[0], at };
    const state = reducer(initial, action);
    expect(state.saved).toHaveLength(1);
    expect(reducer(state, action)).toBe(state);
    expect(reducer(state, { type: 'save', id: action.id, at }).saved).toHaveLength(1);
  });
  it('skip does not save or remove a Discover story', () => {
    const state = reducer(initialState(), { type: 'advance', kind: 'skip', id: 'story-1', at });
    expect(state.cursor).toBe(1);
    expect(state.saved).toHaveLength(0);
    expect(stories.find((s) => s.id === 'story-1')).toBeDefined();
  });
  it('undo after final card restores cursor and exact prior save membership', () => {
    let state = initialState();
    state = reducer(state, { type: 'save', id: state.batch[11], at });
    const batch = state.batch;
    for (const id of batch) state = reducer(state, { type: 'advance', kind: 'save', id, at });
    expect(state.cursor).toBe(12);
    state = reducer(state, { type: 'undo' });
    expect(state.cursor).toBe(11);
    expect(state.saved.find((s) => s.id === batch[11])?.savedAt).toBe(at);
    state = reducer(state, { type: 'undo' });
    expect(state.saved.some((s) => s.id === batch[10])).toBe(false);
  });
  it('new batches exclude saved and viewed; restart resets viewed', () => {
    let state = initialState();
    state = reducer(state, { type: 'advance', kind: 'skip', id: 'story-1', at });
    state = reducer(state, { type: 'save', id: 'story-2', at });
    state = reducer(state, { type: 'batch' });
    expect(state.batch).not.toContain('story-1');
    expect(state.batch).not.toContain('story-2');
    expect(reducer(state, { type: 'batch', restart: true }).batch).toContain('story-1');
  });
});
describe('storage and data', () => {
  it('all 24 stories have valid unique IDs and all seven topics exist', () => {
    expect(stories).toHaveLength(24);
    expect(new Set(stories.map((s) => s.id)).size).toBe(24);
    expect(new Set(stories.flatMap((s) => s.topicIds)).size).toBe(7);
  });
  it('handles invalid JSON and version changes', () => {
    for (const content of ['bad', JSON.stringify({ ...initialState(), version: 2 })]) {
      const result = readStorage({ getItem: () => content, setItem: () => {} });
      expect(result.state.cursor).toBe(0);
      expect(result.warning).not.toBe('');
    }
  });
  it('survives unavailable storage and quota failures', () => {
    const storage = {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('quota');
      },
    };
    expect(readStorage(storage).warning).not.toBe('');
    expect(writeStorage(storage, initialState())).toBe(false);
  });
  it('removes stale IDs and adjusts cursor/history', () => {
    const state = initialState();
    state.batch = ['gone', 'story-1'];
    state.cursor = 2;
    state.saved = [{ id: 'gone', savedAt: at }];
    state.history = [
      { id: 'gone', cursor: 0, prior: null },
      { id: 'story-1', cursor: 1, prior: null },
    ];
    const restored = sanitizeState(state);
    expect(restored.batch).toEqual(['story-1']);
    expect(restored.cursor).toBe(1);
    expect(restored.saved).toEqual([]);
    expect(restored.history).toEqual([{ id: 'story-1', cursor: 0, prior: null }]);
  });
});
