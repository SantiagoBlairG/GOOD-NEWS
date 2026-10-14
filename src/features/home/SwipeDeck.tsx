import { useRef, useState, useEffect, useSyncExternalStore } from 'react';
import { Link } from 'react-router';
import { motion, useMotionValue, useTransform, animate } from 'motion/react';
import { Sun, Undo2, X, Bookmark, ArrowUpRight } from 'lucide-react';
import { useApp } from '../../state/provider';
import { repository, topicName, date } from '../../lib/repository';
import { newBatch } from '../../state/reducer';
import { StoryImage } from '../../components/StoryRow';
import { Button } from '../../components/ui/button';
import type { Story } from '../../lib/schemas';
import { useOpenStory } from '../stories/useOpenStory';
import { useCardSwipe } from './useCardSwipe';
import { DesktopDeck } from './DesktopDeck';
import { useCardArrival } from './useCardArrival';
const desktopQuery = () => window.matchMedia('(min-width: 1024px)');
const subscribeDesktop = (callback: () => void) => {
  const query = desktopQuery();
  query.addEventListener('change', callback);
  return () => query.removeEventListener('change', callback);
};
export function SwipeDeck() {
  const desktop = useSyncExternalStore(
    subscribeDesktop,
    () => desktopQuery().matches,
    () => false,
  );
  return desktop ? <DesktopDeck /> : <MobileDeck />;
}
function MobileDeck() {
  const { state, dispatch, notify, reduced } = useApp();
  const openStory = useOpenStory();
  const [exitingStory, setExitingStory] = useState<Story | null>(null);
  const story = exitingStory ?? repository.get(state.batch[state.cursor] ?? '');
  const card = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const opacity = useMotionValue(1);
  const animations = useRef<Array<{ stop: () => void }>>([]);
  const rotation = useTransform(x, [-250, 0, 250], reduced ? [0, 0, 0] : [-12, 0, 12]);
  const saveOpacity = useTransform(x, [20, 110], [0, 1]);
  const skipOpacity = useTransform(x, [-110, -20], [1, 0]);
  const [locked, setLocked] = useState(false);
  const lock = useRef(false);
  const swipe = useCardSwipe({
    x,
    reduced,
    isLocked: () => lock.current,
    onCommit: (kind) => void commit(kind),
  });
  const { scale, stopArrival } = useCardArrival(story?.id, x, opacity, reduced);
  useEffect(() => () => animations.current.forEach((animation) => animation.stop()), []);
  async function commit(kind: 'skip' | 'save') {
    if (!story || lock.current) return;
    stopArrival();
    lock.current = true;
    setLocked(true);
    setExitingStory(story);
    dispatch({ type: 'advance', kind, id: story.id, at: new Date().toISOString() });
    try {
      animations.current.forEach((animation) => animation.stop());
      const width = card.current?.offsetWidth ?? 350;
      const exitDistance = Math.max(width + 120, Math.abs(x.get()) + width * 0.5);
      const exit = animate(x, reduced ? x.get() : (kind === 'save' ? 1 : -1) * exitDistance, {
        duration: reduced ? 0 : 0.24,
        ease: [0.32, 0.72, 0, 1],
      });
      const fade = animate(opacity, 0, { duration: reduced ? 0.08 : 0.2 });
      animations.current = [exit, fade];
      await Promise.all([exit, fade]);
    } finally {
      setExitingStory(null);
      lock.current = false;
      setLocked(false);
    }
  }
  function undo() {
    if (lock.current) return;
    dispatch({ type: 'undo' });
    notify('Last action undone. Previous story restored.');
  }
  return (
    <div className="home">
      <header className="home-heading">
        <div>
          <h1>A brighter world</h1>
          <p>Your daily dose of perspective.</p>
        </div>
        <Sun className="heading-sun" />
      </header>
      <div className="deck-meta">
        <button className="undo-button" onClick={undo} disabled={!state.history.length || locked}>
          <Undo2 size={17} /> Undo
        </button>
        <span aria-label="Batch progress">
          {Math.min(state.cursor + 1, state.batch.length)} / {state.batch.length} stories
        </span>
      </div>
      {story ? (
        <>
          <div className="deck">
            <div className="behind back-two" aria-hidden="true" />
            <div className="behind back-one" aria-hidden="true" />
            <motion.div
              ref={card}
              key={story.id}
              className="story-card"
              data-testid="swipe-card"
              data-story-link={story.id}
              role="link"
              tabIndex={locked ? -1 : 0}
              aria-label={`Read ${story.title}`}
              style={{ x, rotate: rotation, opacity, scale }}
              onPointerDown={swipe.onPointerDown}
              onPointerMove={swipe.onPointerMove}
              onPointerUp={swipe.onPointerUp}
              onPointerCancel={swipe.onPointerCancel}
              onLostPointerCapture={swipe.onLostPointerCapture}
              onDragStart={(event) => event.preventDefault()}
              onClick={(event) => {
                if (!swipe.wasDragged() && !lock.current) openStory(story.id, event.currentTarget);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  if (!lock.current) openStory(story.id, e.currentTarget);
                }
                if (e.key === 'ArrowRight') {
                  e.preventDefault();
                  void commit('save');
                }
                if (e.key === 'ArrowLeft') {
                  e.preventDefault();
                  void commit('skip');
                }
              }}
            >
              <motion.span
                className="swipe-stamp save-stamp"
                style={{ opacity: saveOpacity }}
                aria-hidden="true"
              >
                SAVE
              </motion.span>
              <motion.span
                className="swipe-stamp skip-stamp"
                style={{ opacity: skipOpacity }}
                aria-hidden="true"
              >
                SKIP
              </motion.span>
              <div className="hero">
                <StoryImage story={story} loading="eager" />
                <div className="hero-copy">
                  <span className="topic">{topicName(story.topicIds[0])}</span>
                  <h2>{story.title}</h2>
                </div>
              </div>
              <div className="card-copy">
                <p>{story.summary}</p>
                <div className="metadata">
                  <span>
                    {story.publisher}
                    <br />
                    {date(story.publishedAt)}
                  </span>
                  <span>
                    {story.readingMinutes} min read <ArrowUpRight size={16} />
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
          <div className="swipe-controls">
            <button
              className="swipe-action skip-action"
              disabled={locked}
              onClick={() => void commit('skip')}
            >
              <span>
                <X size={27} />
              </span>
              Skip
            </button>
            <p>
              Swipe to find your
              <br />
              next bright spot.
            </p>
            <button
              className="swipe-action save-action"
              disabled={locked}
              onClick={() => void commit('save')}
            >
              <span>
                <Bookmark size={25} />
              </span>
              Save
            </button>
          </div>
          <p className="hint">Tap to read · Swipe left to skip, right to save</p>
        </>
      ) : (
        <div className="empty completed">
          <Sun />
          <h2>A little perspective, gained.</h2>
          <p>
            {state.saved.length === 24
              ? 'You’ve saved every story. Your collection is ready whenever you are.'
              : 'You’ve reached the end of this batch. Take a breath, or find a little more good.'}
          </p>
          {newBatch(state).length > 0 ? (
            <Button onClick={() => dispatch({ type: 'batch' })}>
              Browse more <ArrowUpRight size={18} />
            </Button>
          ) : state.saved.length < 24 ? (
            <Button onClick={() => dispatch({ type: 'batch', restart: true })}>
              Restart unsaved stories
            </Button>
          ) : null}
          <Button variant="ghost" asChild>
            <Link to="/discover">Explore Discover</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
