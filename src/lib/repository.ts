import raw from '../data/stories.json';
import { storySchema, type Story } from './schemas';
export interface StoryRepository {
  all(): Story[];
  get(id: string): Story | undefined;
}
const validated = raw.map((s) => storySchema.parse(s));
if (new Set(validated.map((s) => s.id)).size !== validated.length)
  throw new Error('Duplicate story IDs');
export const repository: StoryRepository = {
  all: () => validated,
  get: (id) => validated.find((s) => s.id === id),
};
export const stories = repository.all();
export const topicName = (id: string) =>
  ({
    environment: 'Environment',
    community: 'Community & Kindness',
    science: 'Science & Technology',
    health: 'Health & Medicine',
    education: 'Education',
    opportunity: 'Economic Opportunity',
    wildlife: 'Animals & Wildlife',
  })[id] ?? id;
export const date = (value: string) =>
  new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(value));
