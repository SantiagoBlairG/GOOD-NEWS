import { Link, useLocation } from 'react-router';
import { Bookmark, ArrowUpRight, Leaf } from 'lucide-react';
import type { Story } from '../lib/schemas';
import { date, topicName } from '../lib/repository';
import { useApp } from '../state/provider';
export function StoryImage({
  story,
  loading = 'lazy',
  className,
}: {
  story: Story;
  loading?: 'lazy' | 'eager';
  className?: string;
}) {
  return story.image ? (
    <img
      className={className}
      src={story.image.path}
      alt={story.image.alt}
      loading={loading}
      onError={(event) => {
        event.currentTarget.hidden = true;
        event.currentTarget.parentElement?.classList.add('image-failed');
      }}
    />
  ) : (
    <div
      className={'image-fallback ' + (className ?? '')}
      role="img"
      aria-label="No story photograph available"
    >
      <Leaf />
      <span>A little good.</span>
    </div>
  );
}
export function SaveButton({ story, compact = false }: { story: Story; compact?: boolean }) {
  const { state, dispatch, notify } = useApp();
  const saved = state.saved.find((s) => s.id === story.id);
  return (
    <button
      className={compact ? 'icon-button save-small' : 'button secondary'}
      aria-label={saved ? 'Unsave story' : 'Save story'}
      aria-pressed={!!saved}
      onClick={() => {
        if (saved) {
          dispatch({ type: 'unsave', id: story.id });
          notify('Story removed from Saved.', () => dispatch({ type: 'restore', entry: saved }));
        } else {
          dispatch({ type: 'save', id: story.id, at: new Date().toISOString() });
          notify('Story saved. A little good to come back to.');
        }
      }}
    >
      <Bookmark size={20} fill={saved ? 'currentColor' : 'none'} />
      {!compact && (saved ? 'Saved' : 'Save story')}
    </button>
  );
}
export function StoryRow({ story, grid = false }: { story: Story; grid?: boolean }) {
  const location = useLocation();
  return (
    <div className={grid ? 'small-story' : 'story-row'}>
      <Link
        to={'/story/' + story.id}
        state={{ from: location.pathname + location.search }}
        className="story-row-link"
      >
        <StoryImage story={story} />
        <div>
          <span className="label">{topicName(story.topicIds[0])}</span>
          <h3>{story.title}</h3>
          <p className="metadata">
            {date(story.publishedAt)} · {story.readingMinutes} min read
          </p>
        </div>
      </Link>
      <SaveButton story={story} compact />
      <ArrowUpRight className="row-arrow" size={18} />
    </div>
  );
}
