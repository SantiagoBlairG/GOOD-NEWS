import { useRef, useState, useLayoutEffect } from 'react';
import { Link } from 'react-router';
import { motion, useMotionValue, useTransform, animate } from 'motion/react';
import { ArrowLeft, ArrowRight, ArrowUpRight, Sun, Bookmark, X } from 'lucide-react';
import { stories, topicName, date } from '../../lib/repository';
import { StoryImage, StoryRow, SaveButton } from '../../components/StoryRow';
import { useApp } from '../../state/provider';
import { useOpenStory } from '../stories/useOpenStory';
import { useCardSwipe } from './useCardSwipe';

let rememberedIndex = 0;
export function DesktopDeck() {
  const { state, dispatch, reduced } = useApp();
  const [index, setIndex] = useState(rememberedIndex);
  const [locked, setLocked] = useState(false);
  const lock = useRef(false);
  const openStory = useOpenStory();
  const story = stories[index];
  const card = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const opacity = useMotionValue(1);
  const rotate = useTransform(x, [-600, 0, 600], reduced ? [0, 0, 0] : [-5, 0, 5]);
  useLayoutEffect(() => {
    x.set(0);
    opacity.set(1);
  }, [index, x, opacity]);
  async function move(direction: number, save = false) {
    if (lock.current) return;
    const next = Math.max(0, Math.min(stories.length - 1, index + direction));
    if (save) {
      dispatch({ type: 'save', id: story.id, at: new Date().toISOString() });
    }
    if (next === index) {
      void animate(x, 0, { type: 'spring', stiffness: 350, damping: 30 });
      return;
    }
    lock.current = true;
    setLocked(true);
    await Promise.all([
      animate(x, reduced ? 0 : -direction * (card.current?.offsetWidth ?? 700), {
        duration: reduced ? 0 : 0.25,
        ease: [0.32, 0.72, 0, 1],
      }),
      animate(opacity, 0, { duration: reduced ? 0.08 : 0.18 }),
    ]);
    rememberedIndex = next;
    setIndex(next);
    lock.current = false;
    setLocked(false);
  }
  const swipe = useCardSwipe({
    x,
    reduced,
    isLocked: () => lock.current,
    onCommit: (kind) => void move(1, kind === 'save'),
  });
  const previews = stories.slice(index + 1, index + 3);
  return (
    <section className="desktop-home">
      <header className="desktop-home-heading">
        <div>
          <span className="desktop-eyebrow">A little good, every day</span>
          <h1>A brighter world</h1>
          <p>Your daily dose of perspective.</p>
        </div>
        <Sun className="desktop-heading-sun" aria-hidden="true" />
      </header>
      <div className="desktop-story-layout">
        <div className="desktop-feature-column">
          <div className="desktop-carousel-heading">
            <span>YOUR NEXT BRIGHT SPOT</span>
            <div className="desktop-carousel-controls">
              <span role="status">
                {String(index + 1).padStart(2, '0')} / {stories.length}
              </span>
              <button
                className="icon-button"
                aria-label="Previous story"
                disabled={locked || index === 0}
                onClick={() => void move(-1)}
              >
                <ArrowLeft size={20} />
              </button>
              <button
                className="icon-button"
                aria-label="Next story"
                disabled={locked || index === stories.length - 1}
                onClick={() => void move(1)}
              >
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
          <div className="desktop-card-stage">
            <motion.div
              ref={card}
              key={story.id}
              className="story-card desktop-feature"
              data-testid="swipe-card"
              data-story-link={story.id}
              role="link"
              tabIndex={locked ? -1 : 0}
              aria-label={`Read ${story.title}`}
              style={{ x, opacity, rotate }}
              onPointerDown={swipe.onPointerDown}
              onPointerMove={swipe.onPointerMove}
              onPointerUp={swipe.onPointerUp}
              onPointerCancel={swipe.onPointerCancel}
              onLostPointerCapture={swipe.onLostPointerCapture}
              onDragStart={(event) => event.preventDefault()}
              onClick={(event) => {
                if (!swipe.wasDragged() && !lock.current) openStory(story.id, event.currentTarget);
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  if (!lock.current) openStory(story.id, event.currentTarget);
                }
                if (event.key === 'ArrowRight') {
                  event.preventDefault();
                  void move(1);
                }
                if (event.key === 'ArrowLeft') {
                  event.preventDefault();
                  void move(-1);
                }
              }}
            >
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
                    {story.author?.name} · {date(story.publishedAt)}
                  </span>
                  <span>
                    {story.readingMinutes} min read <ArrowUpRight size={16} />
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
          <div className="desktop-feature-actions">
            <button className="button ghost" disabled={locked} onClick={() => void move(1)}>
              <X size={18} /> Skip
            </button>
            <p>Drag to discover · Click to read</p>
            <SaveButton story={story} />
          </div>
        </div>
        <aside className="desktop-up-next" aria-label="More bright spots">
          <div className="desktop-rail-heading">
            <h2>More bright spots</h2>
            <Link to="/discover" aria-label="Explore all stories">
              <ArrowUpRight size={20} />
            </Link>
          </div>
          {previews.length ? (
            previews.map((next) => (
              <motion.div
                key={next.id}
                initial={{ opacity: reduced ? 1 : 0, y: reduced ? 0 : 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              >
                <StoryRow story={next} grid />
              </motion.div>
            ))
          ) : (
            <div className="desktop-rail-empty">
              <Sun size={30} />
              <h3>A world of good awaits.</h3>
              <Link className="text-button" to="/discover">
                Explore Discover <ArrowUpRight size={16} />
              </Link>
            </div>
          )}
          <div className="desktop-collection-note">
            <Bookmark size={19} />
            <p>
              {state.saved.length
                ? `${state.saved.length} bright spots saved for later.`
                : 'Keep the stories that stay with you.'}
              <Link to="/saved">
                Visit your collection <ArrowRight size={15} />
              </Link>
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}
