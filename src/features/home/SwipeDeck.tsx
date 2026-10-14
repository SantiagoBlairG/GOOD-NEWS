import { useRef, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router';
import { motion, useMotionValue, useTransform, useAnimate } from 'motion/react';
import { Sun, Undo2, X, Bookmark, ArrowUpRight } from 'lucide-react';
import { useApp } from '../../state/provider';
import { repository, topicName, date } from '../../lib/repository';
import { newBatch } from '../../state/reducer';
import { StoryImage } from '../../components/StoryRow';
import { Button } from '../../components/ui/button';
import type { Story } from '../../lib/schemas';
export function SwipeDeck() {
  const { state, dispatch, notify, reduced } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [exitingStory, setExitingStory] = useState<Story | null>(null);
  const story = exitingStory ?? repository.get(state.batch[state.cursor] ?? '');
  const [scope, animate] = useAnimate();
  const x = useMotionValue(0);
  const rotation = useTransform(x, [-250, 0, 250], reduced ? [0, 0, 0] : [-12, 0, 12]);
  const saveOpacity = useTransform(x, [20, 110], [0, 1]);
  const skipOpacity = useTransform(x, [-110, -20], [1, 0]);
  const [locked, setLocked] = useState(false);
  const lock = useRef(false);
  const moved = useRef(false);
  const pointerStart = useRef<{ x: number; y: number } | null>(null);
  async function commit(kind: 'skip' | 'save') {
    if (!story || lock.current) return;
    lock.current = true;
    setLocked(true);
    setExitingStory(story);
    dispatch({ type: 'advance', kind, id: story.id, at: new Date().toISOString() });
    notify(
      `${kind === 'save' ? 'Saved' : 'Skipped'}. ${repository.get(state.batch[state.cursor + 1] ?? '')?.title ?? 'This batch is complete.'}`,
    );
    try {
      await animate(
        scope.current,
        {
          x: reduced ? 0 : kind === 'save' ? 550 : -550,
          opacity: 0,
          rotate: reduced ? 0 : kind === 'save' ? 12 : -12,
        },
        { duration: reduced ? 0.08 : 0.28 },
      );
      x.set(0);
      if (scope.current)
        await animate(scope.current, { x: 0, rotate: 0, opacity: 1 }, { duration: 0 });
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
          <h1>
            A little good.
            <br />A brighter world.
          </h1>
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
              ref={scope}
              key={story.id}
              className="story-card"
              data-testid="swipe-card"
              role="link"
              tabIndex={locked ? -1 : 0}
              aria-label={`Read ${story.title}`}
              style={{ x, rotate: rotation }}
              drag={locked ? false : 'x'}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.85}
              dragSnapToOrigin
              onPointerDown={(e) => {
                moved.current = false;
                pointerStart.current = { x: e.clientX, y: e.clientY };
              }}
              onPointerMove={(e) => {
                if (
                  pointerStart.current &&
                  Math.hypot(
                    e.clientX - pointerStart.current.x,
                    e.clientY - pointerStart.current.y,
                  ) > 8
                )
                  moved.current = true;
              }}
              onPointerCancel={() => {
                pointerStart.current = null;
                moved.current = true;
                x.set(0);
              }}
              onDragEnd={(event, info) => {
                moved.current = true;
                if (event.type === 'pointercancel') return;
                const width = scope.current?.getBoundingClientRect().width ?? 350;
                if (
                  Math.abs(info.offset.x) > width * 0.25 ||
                  (Math.abs(info.offset.x) >= 40 && Math.abs(info.velocity.x) > 700)
                )
                  void commit(info.offset.x > 0 ? 'save' : 'skip');
              }}
              onClick={() => {
                if (!moved.current && !lock.current)
                  navigate('/story/' + story.id, { state: { from: location.pathname } });
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  navigate('/story/' + story.id, { state: { from: '/' } });
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
                <span className="demo-tag">Demo story</span>
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
