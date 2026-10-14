import { z } from 'zod';
export const topics = [
  { id: 'environment', name: 'Environment' },
  { id: 'community', name: 'Community & Kindness' },
  { id: 'science', name: 'Science & Technology' },
  { id: 'health', name: 'Health & Medicine' },
  { id: 'education', name: 'Education' },
  { id: 'opportunity', name: 'Economic Opportunity' },
  { id: 'wildlife', name: 'Animals & Wildlife' },
];
export const storySchema = z.object({
  id: z.string().min(1),
  slug: z.string(),
  title: z.string().min(1),
  summary: z.string(),
  body: z.array(z.string()).min(1),
  whyItMatters: z.string(),
  topicIds: z.array(z.string().refine((id) => topics.some((t) => t.id === id))).min(1),
  tags: z.array(z.string()),
  publishedAt: z.iso.datetime(),
  readingMinutes: z.number().int().positive(),
  publisher: z.string(),
  author: z
    .object({ name: z.string(), avatarPath: z.string().startsWith('/images/authors/').optional() })
    .nullable(),
  image: z
    .object({
      path: z.string().startsWith('/images/'),
      alt: z.string(),
      credit: z.string(),
      license: z.string(),
    })
    .nullable(),
  location: z
    .object({
      countryCode: z.string(),
      countryName: z.string(),
      placeName: z.string(),
      longitude: z.number().min(-180).max(180),
      latitude: z.number().min(-90).max(90),
    })
    .nullable(),
  sourceUrl: z.url().nullable(),
  isDemo: z.literal(true),
});
export type Story = z.infer<typeof storySchema>;
