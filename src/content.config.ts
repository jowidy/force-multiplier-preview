import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const entries = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/entries' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    lead: z.string(),
    path: z.string().startsWith('/'),
    kind: z.enum(['case', 'article', 'service', 'landing']),
    category: z.string(),
    order: z.number(),
    sourceUrl: z.string(),
    draft: z.boolean().default(false),
    related: z.array(z.string()).default([]),
    takeaway: z.string().optional(),
    evidenceLabel: z.string().optional(),
  }),
});
export const collections = { entries };
