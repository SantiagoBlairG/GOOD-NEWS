import type { Story } from '../../lib/schemas';
import { topicName } from '../../lib/repository';
export function filterStories(stories: Story[], query: string, topic: string) {
  const q = query.trim().toLocaleLowerCase();
  return stories.filter(
    (s) =>
      (!topic || s.topicIds.includes(topic)) &&
      (!q ||
        [
          s.title,
          s.summary,
          s.publisher,
          ...s.tags,
          ...s.topicIds.map(topicName),
          s.location?.countryName,
          s.location?.placeName,
        ]
          .filter(Boolean)
          .join(' ')
          .toLocaleLowerCase()
          .includes(q)),
  );
}
export function storyGeoJSON(stories: Story[]) {
  const locations = new Map<
    string,
    { coordinates: [number, number]; ids: string[]; place: string }
  >();
  for (const story of stories) {
    if (!story.location) continue;
    const { longitude, latitude, placeName } = story.location;
    const key = `${longitude},${latitude}`;
    const group = locations.get(key) ?? {
      coordinates: [longitude, latitude],
      ids: [],
      place: placeName,
    };
    group.ids.push(story.id);
    locations.set(key, group);
  }
  return {
    type: 'FeatureCollection' as const,
    features: [...locations.values()].map((g) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: g.coordinates },
      properties: { ids: JSON.stringify(g.ids), count: g.ids.length, place: g.place },
    })),
  };
}
