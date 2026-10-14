import { useEffect, useRef, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router';
import { ArrowLeft, Share2, MapPin, Clock } from 'lucide-react';
import { stories, repository, topicName, date } from '../../lib/repository';
import { SaveButton, StoryImage, StoryRow } from '../../components/StoryRow';
import { Button } from '../../components/ui/button';
import { Modal } from '../../components/ui/dialog';
import { useApp } from '../../state/provider';
export function Article() {
  const { storyId } = useParams();
  const s = repository.get(storyId ?? '');
  const location = useLocation();
  const navigate = useNavigate();
  const { notify } = useApp();
  const title = useRef<HTMLHeadingElement>(null);
  const [shareFallback, setFallback] = useState(false);
  useEffect(() => {
    title.current?.focus({ preventScroll: true });
  }, [storyId]);
  if (!s)
    return (
      <div className="empty">
        <h1>Story not found.</h1>
        <Button onClick={() => navigate('/')}>Back to Home</Button>
      </div>
    );
  const related = stories
    .filter((item) => item.id !== s.id)
    .sort((a, b) => {
      const rank = (item: typeof s) =>
        item!.topicIds.filter((t) => s.topicIds.includes(t)).length * 10 +
        Number(!!s.location && item!.location?.countryCode === s.location.countryCode);
      return rank(b) - rank(a);
    })
    .slice(0, 3);
  async function share() {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: s!.title,
          text: 'A bright spot from Bright Side',
          url,
        });
        return;
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
    }
    try {
      await navigator.clipboard.writeText(url);
      notify('Article link copied.');
    } catch {
      setFallback(true);
    }
  }
  return (
    <article className="article">
      <div className="hero article-hero">
        <StoryImage story={s} loading="eager" />
        <div className="article-toolbar">
          <Button
            variant="secondary"
            onClick={() => {
              const origin = location.state?.from;
              if (typeof origin === 'string' && origin.startsWith('/')) navigate(-1);
              else navigate('/');
            }}
          >
            <ArrowLeft size={18} />
            Back
          </Button>
          <div>
            <SaveButton story={s} compact />
            <button
              className="icon-button"
              aria-label="Share story"
              onClick={(event) => {
                event.currentTarget.focus();
                void share();
              }}
            >
              <Share2 size={20} />
            </button>
          </div>
        </div>
        <div className="hero-copy">
          <span className="topic">{topicName(s.topicIds[0])}</span>
          <h1 ref={title} tabIndex={-1}>
            {s.title}
          </h1>
        </div>
      </div>
      <div className="reading">
        <p className="article-summary">{s.summary}</p>
        <div className="article-meta">
          <span>{date(s.publishedAt)}</span>
          <span>
            <Clock size={15} />
            {s.readingMinutes} min read
          </span>
          <span>
            <MapPin size={15} />
            {s.location
              ? `${s.location.placeName}, ${s.location.countryName}`
              : 'Global / location unspecified'}
          </span>
        </div>
        <div className="publisher">
          {s.author?.avatarPath && (
            <img
              className="author-avatar"
              src={s.author.avatarPath}
              alt={s.author.name}
              width={48}
              height={48}
            />
          )}
          <div>
            <strong>{s.author?.name ?? s.publisher}</strong>
            {s.author && <p>{s.publisher}</p>}
          </div>
        </div>
        {s.body.map((p) => (
          <p key={p}>{p}</p>
        ))}
        <div className="why">
          <h2>Why this matters</h2>
          <p>{s.whyItMatters}</p>
        </div>
        <p className="image-credit">
          {s.image ? `Image: ${s.image.credit}. ${s.image.license}.` : 'No image available.'}
        </p>
        <SaveButton story={s} />
        <h2>More bright spots</h2>
        {related.map((story) => (
          <StoryRow key={story.id} story={story} />
        ))}
      </div>
      <Modal
        open={shareFallback}
        onOpenChange={setFallback}
        title="Share this bright spot"
        description="Copy the address below to share this story."
      >
        <label htmlFor="share-url">Article URL</label>
        <input
          id="share-url"
          readOnly
          value={window.location.href}
          onFocus={(e) => e.currentTarget.select()}
        />
      </Modal>
    </article>
  );
}
