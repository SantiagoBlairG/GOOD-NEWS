import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { AppProvider, useApp } from '../state/provider';
function Probe() {
  const { state, dispatch, storageWarning } = useApp();
  return (
    <>
      <p>{storageWarning}</p>
      <p data-testid="saves">{state.saved.length}</p>
      <button onClick={() => dispatch({ type: 'save', id: 'story-1', at: '2026-10-14T12:00:00Z' })}>
        Save
      </button>
    </>
  );
}
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
describe('storage failure UI', () => {
  it('shows a nonblocking warning and keeps in-memory saving functional', () => {
    vi.stubGlobal('matchMedia', () => ({
      matches: false,
      addEventListener: () => {},
      removeEventListener: () => {},
    }));
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota');
    });
    render(
      <AppProvider>
        <Probe />
      </AppProvider>,
    );
    expect(screen.getByText(/Changes are kept for this session only/)).toBeDefined();
    fireEvent.click(screen.getByText('Save'));
    expect(screen.getByTestId('saves').textContent).toBe('1');
  });
});
