import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useState,
  useCallback,
  useSyncExternalStore,
  type ReactNode,
  type Dispatch,
} from 'react';
import { reducer, type State, type Action, initialState } from './reducer';
import { X } from 'lucide-react';
import { readStorage, writeStorage } from '../lib/storage';
type Toast = { message: string; undo?: () => void };
const subscribeMotion = (callback: () => void) => {
  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  media.addEventListener('change', callback);
  return () => media.removeEventListener('change', callback);
};
const motionPreference = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const Context = createContext<{
  state: State;
  dispatch: Dispatch<Action>;
  notify: (message: string, undo?: () => void) => void;
  reduced: boolean;
  storageWarning: string;
} | null>(null);
function read() {
  try {
    return readStorage(window.localStorage);
  } catch {
    return {
      state: initialState(),
      warning: 'Storage is unavailable. Changes will last for this session only.',
    };
  }
}
export function AppProvider({ children }: { children: ReactNode }) {
  const [loaded] = useState(read);
  const [state, dispatch] = useReducer(reducer, loaded.state);
  const [storageWarning, setWarning] = useState(loaded.warning);
  const [toast, setToast] = useState<Toast | null>(null);
  const osReduced = useSyncExternalStore(subscribeMotion, motionPreference, () => false);
  const notify = useCallback(
    (message: string, undo?: () => void) => setToast({ message, undo }),
    [],
  );
  useEffect(() => {
    let saved = false;
    try {
      saved = writeStorage(window.localStorage, state);
    } catch {
      /* In-memory state remains available. */
    }
    if (!saved)
      setWarning(
        'Changes are kept for this session only. Your browser could not save them to this device.',
      );
  }, [state]);
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 6000);
    return () => clearTimeout(timer);
  }, [toast]);
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => {
      document.documentElement.dataset.theme =
        state.preferences.appearance === 'system'
          ? media.matches
            ? 'dark'
            : 'light'
          : state.preferences.appearance;
      document.documentElement.dataset.reduced = String(
        state.preferences.reduceMotion || osReduced,
      );
    };
    apply();
    media.addEventListener('change', apply);
    return () => media.removeEventListener('change', apply);
  }, [state.preferences.appearance, state.preferences.reduceMotion, osReduced]);
  return (
    <Context.Provider
      value={{
        state,
        dispatch,
        notify,
        reduced: !!osReduced || state.preferences.reduceMotion,
        storageWarning,
      }}
    >
      {children}
      <div className="toast-area" aria-live="polite" aria-atomic="true">
        {toast && (
          <div className="toast">
            <span>{toast.message}</span>
            {toast.undo && (
              <button
                className="toast-undo"
                onClick={() => {
                  toast.undo?.();
                  setToast(null);
                }}
              >
                Undo
              </button>
            )}
            <button
              className="toast-close"
              aria-label="Dismiss notification"
              onClick={() => setToast(null)}
            >
              <X size={22} aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </Context.Provider>
  );
}
export function useApp() {
  const context = useContext(Context);
  if (!context) throw new Error('Missing provider');
  return context;
}
