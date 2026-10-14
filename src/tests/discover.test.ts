import { describe, it, expect } from 'vitest';
import { filterStories, storyGeoJSON } from '../features/discover/filter';
import { stories } from '../lib/repository';
describe('Discover', () => {
  it('combines search and topic with AND and matches names without case sensitivity', () => {
    const results = filterStories(stories, 'BOGOTÁ', 'community');
    expect(results.map((s) => s.id)).toEqual(['story-2', 'story-6']);
    expect(filterStories(stories, 'bogotá', 'science')).toEqual([]);
    expect(filterStories(stories, 'Health & Medicine', '')).toHaveLength(3);
  });
  it('groups identical coordinates without losing story IDs or pinning global stories', () => {
    const features = storyGeoJSON(stories).features;
    const bogota = features.find((f) => f.properties.place === 'Bogotá')!;
    expect(bogota.geometry.coordinates).toEqual([-74.07, 4.71]);
    expect(JSON.parse(bogota.properties.ids)).toEqual(['story-2', 'story-6']);
    expect(features.flatMap((f) => JSON.parse(f.properties.ids))).toHaveLength(
      stories.filter((s) => s.location).length,
    );
    expect(features.every((f) => f.properties.place !== 'Global')).toBe(true);
  });
});
