import { z } from 'zod';
import { stories } from '../lib/repository';
import { topics } from '../lib/schemas';
const id = z.string();
export const preferencesSchema = z.object({
  topics: z.array(z.string()),
  appearance: z.enum(['light', 'dark', 'system']),
  reduceMotion: z.boolean(),
});
const savedEntry = z.object({ id, savedAt: z.iso.datetime() });
const historyEntry = z.object({
  id,
  cursor: z.number().int().min(0),
  prior: z.iso.datetime().nullable(),
});
export const stateSchema = z.object({
  version: z.literal(1),
  saved: z.array(savedEntry),
  preferences: preferencesSchema,
  batch: z.array(id).max(12),
  cursor: z.number().int().min(0),
  history: z.array(historyEntry),
  viewed: z.array(id),
});
export type State = z.infer<typeof stateSchema>;
export type Preferences = z.infer<typeof preferencesSchema>;
export type Action =
  | { type: 'advance'; kind: 'skip' | 'save'; id: string; at: string }
  | { type: 'undo' }
  | { type: 'save'; id: string; at: string }
  | { type: 'unsave'; id: string }
  | { type: 'restore'; entry: { id: string; savedAt: string } }
  | { type: 'batch'; restart?: boolean }
  | { type: 'preferences'; value: Preferences }
  | { type: 'reset' };
const known = new Set(stories.map((s) => s.id));
export function newBatch(state: Pick<State, 'saved' | 'preferences' | 'viewed'>, restart = false) {
  const saved = new Set(state.saved.map((s) => s.id));
  const candidates = stories.filter(
    (s) => !saved.has(s.id) && (restart || !state.viewed.includes(s.id)),
  );
  return candidates
    .sort(
      (a, b) =>
        Number(b.topicIds.some((t) => state.preferences.topics.includes(t))) -
        Number(a.topicIds.some((t) => state.preferences.topics.includes(t))),
    )
    .slice(0, 12)
    .map((s) => s.id);
}
export function initialState(): State {
  const state: State = {
    version: 1,
    saved: [],
    preferences: { topics: [], appearance: 'system', reduceMotion: false },
    batch: [],
    cursor: 0,
    history: [],
    viewed: [],
  };
  state.batch = newBatch(state);
  return state;
}
export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'advance': {
      if (state.batch[state.cursor] !== action.id) return state;
      const prior = state.saved.find((s) => s.id === action.id)?.savedAt ?? null;
      return {
        ...state,
        cursor: state.cursor + 1,
        saved:
          action.kind === 'save' && prior === null
            ? [...state.saved, { id: action.id, savedAt: action.at }]
            : state.saved,
        viewed: [...new Set([...state.viewed, action.id])],
        history: [...state.history, { id: action.id, cursor: state.cursor, prior }],
      };
    }
    case 'undo': {
      const last = state.history.at(-1);
      if (!last) return state;
      const saved = state.saved.filter((s) => s.id !== last.id);
      if (last.prior) saved.push({ id: last.id, savedAt: last.prior });
      return {
        ...state,
        cursor: last.cursor,
        saved,
        history: state.history.slice(0, -1),
        viewed: state.viewed.filter((id) => id !== last.id),
      };
    }
    case 'save':
      return !known.has(action.id) || state.saved.some((s) => s.id === action.id)
        ? state
        : { ...state, saved: [...state.saved, { id: action.id, savedAt: action.at }] };
    case 'unsave':
      return { ...state, saved: state.saved.filter((s) => s.id !== action.id) };
    case 'restore':
      return reducer(state, { type: 'save', id: action.entry.id, at: action.entry.savedAt });
    case 'batch':
      return {
        ...state,
        batch: newBatch(state, action.restart),
        cursor: 0,
        history: [],
        viewed: action.restart ? [] : state.viewed,
      };
    case 'preferences':
      return { ...state, preferences: action.value };
    case 'reset':
      return initialState();
  }
}
export function sanitizeState(value: unknown): State {
  const parsed = stateSchema.parse(value);
  const saved = [
    ...new Map(parsed.saved.filter((s) => known.has(s.id)).map((s) => [s.id, s])).values(),
  ];
  const batch = parsed.batch.filter((id) => known.has(id));
  const cursor = parsed.batch.slice(0, parsed.cursor).filter((id) => known.has(id)).length;
  const history = parsed.history
    .filter((h) => known.has(h.id) && parsed.batch[h.cursor] === h.id && h.cursor < parsed.cursor)
    .map((h) => ({
      ...h,
      cursor: parsed.batch.slice(0, h.cursor).filter((id) => known.has(id)).length,
    }));
  return {
    ...parsed,
    saved,
    batch,
    cursor: Math.min(cursor, batch.length),
    history,
    viewed: parsed.viewed.filter((id) => known.has(id)),
    preferences: {
      ...parsed.preferences,
      topics: parsed.preferences.topics.filter((id) => topics.some((t) => t.id === id)),
    },
  };
}
