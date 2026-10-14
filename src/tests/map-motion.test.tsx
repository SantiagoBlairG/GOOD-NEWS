import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, act, cleanup } from '@testing-library/react';
import { stories } from '../lib/repository';
import { AppProvider, useApp } from '../state/provider';
const mock = vi.hoisted(() => ({
  events: new Map<string, (event: unknown) => unknown>(),
  easeTo: vi.fn(),
  remove: vi.fn(),
  setData: vi.fn(),
}));
vi.mock('maplibre-gl', () => ({
  setWorkerUrl: vi.fn(),
  Map: class {
    on(
      event: string,
      layerOrCallback: string | ((event: unknown) => unknown),
      callback?: (event: unknown) => unknown,
    ) {
      mock.events.set(
        event + (typeof layerOrCallback === 'string' ? ':' + layerOrCallback : ''),
        typeof layerOrCallback === 'function' ? layerOrCallback : callback!,
      );
    }
    setStyle() {}
    addSource() {}
    addLayer() {}
    remove() {
      mock.remove();
    }
    easeTo(value: unknown) {
      mock.easeTo(value);
    }
    getCanvas() {
      return { style: { cursor: '' } };
    }
    getSource() {
      return {
        setData: mock.setData,
        getClusterLeaves: async () => [{ properties: { ids: '["story-1","story-14"]' } }],
        getClusterExpansionZoom: async () => 4,
      };
    }
  },
}));
import StoryMap from '../features/discover/StoryMap';
function MotionToggle() {
  const { state, dispatch } = useApp();
  return (
    <button
      onClick={() =>
        dispatch({ type: 'preferences', value: { ...state.preferences, reduceMotion: true } })
      }
    >
      Reduce motion
    </button>
  );
}
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
  mock.events.clear();
});
describe('map lifecycle and effective motion', () => {
  it('returns all cluster stories and respects a live app override without remounting', async () => {
    localStorage.clear();
    vi.stubGlobal('matchMedia', () => ({
      matches: false,
      addEventListener: () => {},
      removeEventListener: () => {},
    }));
    const select = vi.fn();
    const view = render(
      <AppProvider>
        <StoryMap stories={stories} onSelect={select} />
        <MotionToggle />
      </AppProvider>,
    );
    await act(async () => {
      await mock.events.get('load')?.({});
    });
    const event = {
      features: [
        { properties: { cluster_id: 1 }, geometry: { type: 'Point', coordinates: [-84.09, 9.93] } },
      ],
    };
    await act(async () => {
      await mock.events.get('click:clusters')?.(event);
    });
    expect(select).toHaveBeenCalledWith(['story-1', 'story-14']);
    expect(mock.easeTo).toHaveBeenLastCalledWith({
      center: [-84.09, 9.93],
      zoom: 4,
      duration: 250,
    });
    fireEvent.click(screen.getByText('Reduce motion'));
    await act(async () => {
      await mock.events.get('click:clusters')?.(event);
    });
    expect(mock.easeTo).toHaveBeenLastCalledWith({ center: [-84.09, 9.93], zoom: 4, duration: 0 });
    view.unmount();
    expect(mock.remove).toHaveBeenCalledOnce();
  });
});
