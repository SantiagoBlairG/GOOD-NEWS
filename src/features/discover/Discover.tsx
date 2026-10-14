import { lazy, Suspense, useRef, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { Search, ArrowUpRight, Map, List, ArrowLeft } from 'lucide-react';
import { stories } from '../../lib/repository';
import { topics } from '../../lib/schemas';
import { filterStories } from './filter';
import { Button } from '../../components/ui/button';
import { StoryRow } from '../../components/StoryRow';
import { Modal } from '../../components/ui/dialog';
const StoryMap = lazy(() => import('./StoryMap'));
function LazyMap({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '100px' },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={ref} className="lazy-map">
      {visible ? (
        <Suspense fallback={<div className="map-status">Opening a world of good…</div>}>
          {children}
        </Suspense>
      ) : (
        <div className="map-status">Global Goodness</div>
      )}
    </div>
  );
}
export function Discover({ fullMap = false }: { fullMap?: boolean }) {
  const [params, setParams] = useSearchParams();
  const query = params.get('q') ?? '';
  const topic = params.get('topic') ?? '';
  const list = params.get('view') === 'list';
  const filtered = filterStories(stories, query, topic);
  const [selected, setSelected] = useState<string[]>([]);
  const selectedStories = filtered.filter((s) => selected.includes(s.id));
  function update(key: string, value: string) {
    setParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        if (value) next.set(key, value);
        else next.delete(key);
        return next;
      },
      { replace: true },
    );
  }
  const suffix = params.toString() ? '?' + params.toString() : '';
  return (
    <section className="discover">
      {fullMap && (
        <Button variant="ghost" asChild>
          <Link to={'/discover' + suffix}>
            <ArrowLeft size={17} /> Discover
          </Link>
        </Button>
      )}
      <h1>{fullMap ? 'Global Goodness' : 'Good, everywhere.'}</h1>
      <p className="intro">
        {fullMap
          ? 'A world of bright spots. Explore the map or browse the list.'
          : 'Fresh perspectives. Small victories. A world moving forward.'}
      </p>
      <label className="search-label" htmlFor="story-search">
        Search stories
      </label>
      <div className="search-box">
        <Search size={20} />
        <input
          id="story-search"
          type="search"
          value={query}
          placeholder="Try a topic, place, or a little inspiration"
          onChange={(e) => update('q', e.target.value)}
        />
      </div>
      {!fullMap && (
        <div className="global-preview">
          <LazyMap>
            <StoryMap stories={filtered} onSelect={setSelected} preview />
          </LazyMap>
          <div className="global-preview-copy">
            <h2>Hope has no borders.</h2>
            <p>Discover good from around the world.</p>
            <Button asChild>
              <Link to={'/discover/map' + suffix}>
                View map <ArrowUpRight size={18} />
              </Link>
            </Button>
          </div>
        </div>
      )}
      <h2 className="topic-heading">Follow your curiosity</h2>
      <div className="topic-pills">
        <button
          className={'pill ' + (!topic ? 'selected' : '')}
          aria-pressed={!topic}
          onClick={() => update('topic', '')}
        >
          All stories
        </button>
        {topics.map((t) => (
          <button
            className={'pill ' + (topic === t.id ? 'selected' : '')}
            aria-pressed={topic === t.id}
            onClick={() => update('topic', topic === t.id ? '' : t.id)}
            key={t.id}
          >
            {t.name}
          </button>
        ))}
      </div>
      {fullMap && (
        <div className="view-toggle" aria-label="Choose map or list">
          <button
            className={!list ? 'selected' : ''}
            onClick={() => update('view', '')}
            aria-pressed={!list}
          >
            <Map size={18} />
            Map
          </button>
          <button
            className={list ? 'selected' : ''}
            onClick={() => update('view', 'list')}
            aria-pressed={list}
          >
            <List size={18} />
            List
          </button>
        </div>
      )}
      {fullMap && !list && (
        <>
          <LazyMap>
            <StoryMap stories={filtered} onSelect={setSelected} />
          </LazyMap>
          <p className="map-help">
            Select a green marker to explore its stories.{' '}
            {filtered.filter((s) => !s.location).length} stories have no map location and remain
            available below.
          </p>
        </>
      )}
      <div className="results-heading">
        <h2>{fullMap ? 'Stories in this view' : 'Your next bright spot'}</h2>
        <span role="status">
          {filtered.length} {filtered.length === 1 ? 'story' : 'stories'}
        </span>
        {(query || topic) && (
          <button
            className="text-button"
            onClick={() => setParams(list ? { view: 'list' } : {}, { replace: true })}
          >
            Clear filters
          </button>
        )}
      </div>
      {filtered.length ? (
        <div className={fullMap ? 'map-story-list' : 'story-grid'}>
          {filtered.map((s) => (
            <StoryRow story={s} key={s.id} grid={!fullMap} />
          ))}
        </div>
      ) : (
        <div className="empty">
          <Search />
          <h2>No stories here just yet.</h2>
          <p>Try another search or remove a topic filter.</p>
          <Button
            variant="secondary"
            onClick={() => setParams(list ? { view: 'list' } : {}, { replace: true })}
          >
            Clear filters
          </Button>
        </div>
      )}
      <Modal
        sheet
        open={selectedStories.length > 0}
        onOpenChange={(open) => {
          if (!open) setSelected([]);
        }}
        title={selectedStories[0]?.location?.placeName ?? 'Stories at this location'}
        description="Fictional demo stories at the selected map location."
      >
        {selectedStories.map((story) => (
          <StoryRow key={story.id} story={story} />
        ))}
      </Modal>
    </section>
  );
}
