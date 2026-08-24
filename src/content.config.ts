// 1. Import utilities from `astro:content`
import { defineCollection, z } from "astro:content";
import { rssSchema } from '@astrojs/rss';

import { siteConfig } from "./data/site";

const { name, url, description} = siteConfig;
const today = new Date();
// 2. Import loader(s)
import { glob, file } from "astro/loaders";

// 3. Define your collection(s)
const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
  schema: ({ image }) => z.object({
    title: z.string(),
    slug: z.string(),
    pubDate: z.date().default(today),
    modDate: z.date().default(today),
    author: z.string(),
    authorBio: z.string().optional(),
    authorId: z.string().optional(),
    authorImage: z.string().optional(),
    authorImageAlt: z.string().default(`Expert author at${name}`),
    coverAlt: z.string().optional(),
    description: z.string().default('Add a description for your article'),
    tags: z.array(z.string()),
    category: z.string(),
    seo: z.string().optional().default(description),
    image: image().optional(),
    faq: z.array(z.object({
      question: z.string(),
      answer: z.string(),
    })).optional(),


  })
});

const reviews = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/reviews" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishDate: z.string(),
    slug: z.string().optional(),
    updateDate: z.string().optional(),
    author: z.object({
      name: z.string(),
      image: z.string(),
      bio: z.string(),
      expertise: z.array(z.string()),
    }),
    rating: z.number().min(0).max(10),
    category: z.string(),
    image: z.string().url(),
    pros: z.array(z.string()),
    cons: z.array(z.string()),
    product: z.object({
      name: z.string(),
      brand: z.string(),
      image: z.string().url(),
      price: z.number(),
      sku: z.string(),
      specifications: z.array(
        z.object({
          category: z.string(),
          items: z.array(
            z.object({
              label: z.string(),
              value: z.string(),
            }),
          ),
        }),
      ),
    }),
  }),
});

// 4. Export a single `collections` object to register your collection(s)
export const collections = { blog };
