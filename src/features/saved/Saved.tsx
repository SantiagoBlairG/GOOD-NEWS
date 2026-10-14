import { Link, useParams } from 'react-router';
import { Bookmark, ArrowLeft, ArrowUpRight } from 'lucide-react';
import { useApp } from '../../state/provider';
import { repository, topicName } from '../../lib/repository';
import { topics } from '../../lib/schemas';
import { StoryImage, StoryRow } from '../../components/StoryRow';
import { Button } from '../../components/ui/button';
export function Saved() {
  const { state } = useApp();
  const { topicId } = useParams();
  const all = state.saved
    .slice()
    .sort((a, b) => b.savedAt.localeCompare(a.savedAt))
    .flatMap((entry) => {
      const story = repository.get(entry.id);
      return story ? [story] : [];
    });
  const visible = topicId ? all.filter((s) => s.topicIds.includes(topicId)) : all;
  const collections = topics
    .map((topic) => ({ ...topic, stories: all.filter((s) => s.topicIds.includes(topic.id)) }))
    .filter((t) => t.stories.length > 0);
  if (topicId && !topics.some((t) => t.id === topicId))
    return (
      <section className="empty">
        <h1>Collection not found.</h1>
        <Button asChild>
          <Link to="/saved">All saved stories</Link>
        </Button>
      </section>
    );
  return (
    <section className="saved">
      {topicId && (
        <Button asChild variant="ghost">
          <Link to="/saved">
            <ArrowLeft size={17} />
            All saved stories
          </Link>
        </Button>
      )}
      <h1>{topicId ? topicName(topicId) : 'Keep the good close.'}</h1>
      <p className="intro">
        {topicId
          ? `${visible.length} saved ${visible.length === 1 ? 'story' : 'stories'} in this collection.`
          : 'The stories that stayed with you, all in one place.'}
      </p>
      {!topicId && collections.length > 0 && (
        <>
          <h2 className="section-title">Your collections</h2>
          <div className="collections">
            {collections.map((t) => (
              <Link className="collection" key={t.id} to={'/saved/topic/' + t.id}>
                <StoryImage story={t.stories[0]} />
                <div>
                  <h3>{t.name}</h3>
                  <span>
                    {t.stories.length} {t.stories.length === 1 ? 'story' : 'stories'}
                  </span>
                  <ArrowUpRight size={18} />
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
      <div className="results-heading">
        <h2>{topicId ? 'Saved in this collection' : 'All saved stories'}</h2>
        <span>
          {visible.length} {visible.length === 1 ? 'story' : 'stories'}
        </span>
      </div>
      {visible.length ? (
        <div className="saved-list">
          {visible.map((story) => (
            <StoryRow story={story} key={story.id} />
          ))}
        </div>
      ) : (
        <div className="empty">
          <Bookmark />
          <h2>
            {topicId ? 'A little room for more good.' : 'Your next bright spot belongs here.'}
          </h2>
          <p>
            {topicId
              ? 'This collection has no saved stories. Explore a topic and save something that speaks to you.'
              : 'Save a story with a right swipe or the Save button. It’ll be waiting for you here.'}
          </p>
          <Button asChild>
            <Link to={topicId ? '/discover?topic=' + topicId : '/'}>
              Discover a story <ArrowUpRight size={18} />
            </Link>
          </Button>
        </div>
      )}
    </section>
  );
}
