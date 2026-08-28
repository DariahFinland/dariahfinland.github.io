// src/content.config.ts
//
// Draft Astro content-collection schema, mirrored from the Payload collections
// in src/collections/*.ts and the blocks in src/blocks/*/config.ts.
//
// NOTES ON KEY DECISIONS (read before using):
//
// 1. Rich text -> markdown strings.
//    Payload's Lexical rich text becomes a plain markdown string in frontmatter
//    wherever a block/collection has MULTIPLE rich text areas (e.g. a page's
//    hero text, plus each Content-block column, plus each TabsBlock tab).
//    Only collections with ONE rich text field per document (posts, events,
//    tools, affiliated-groups) use the file's main Markdown body instead --
//    that's the one place Markdown's single-body-per-file model fits naturally.
//    PagesCMS supports a "rich-text"/markdown field type on any key, including
//    nested ones inside object/list fields, so this is editable, just not as
//    the "body" of the file for those nested cases.
//
// 2. Relationships -> reference().
//    Payload's `relationship` fields become Astro's reference(), which points
//    at another collection entry by its slug/id. PagesCMS renders these as a
//    picker field if you set type: "reference" pointing at the right collection
//    in .pages.yml.
//
// 3. Live queries (Archive, TabsBlock listType, UpcomingEvents) are now
//    build-time queries, not runtime ones. The schema still stores the
//    editor's *intent* (e.g. "show 3 upcoming events") -- your Astro page
//    template resolves the actual list at build time via getCollection().
//
// 4. Payload's `users` collection did double duty as CMS login + post author.
//    Since PagesCMS uses GitHub auth for editing, there's no need for a
//    `users` collection anymore -- `posts.authors` is just a plain string array.
//
// 5. `media` is not modeled as its own collection here. Each field that used
//    to be an `upload` relationship now stores a plain asset path + alt text
//    directly. This is simpler for a Git-based workflow, at the cost of no
//    longer being able to reuse a single "media item" (with one alt/caption)
//    across multiple documents -- alt text has to be re-entered per use.
//    Flag this to your editors; it's the one real behavior change.
//
// 6. FormBlock is dropped entirely (confirmed not needed for this site).

import { defineCollection, reference, z } from 'astro:content'
import { glob, file } from 'astro/loaders'

// ---------- Shared field helpers ----------

const linkSchema = z.object({
  label: z.string(),
  url: z.string(), // internal path or external URL
  newTab: z.boolean().optional(),
})

const heroSchema = z.object({
  type: z.enum(['none', 'highImpact', 'mediumImpact', 'lowImpact']).default('lowImpact'),
  richText: z.string().optional(), // markdown string, not file body (see note 1)
  links: z.array(linkSchema).max(2).optional(),
  media: z.string().optional(), // required in practice for highImpact/mediumImpact
  mediaAlt: z.string().optional(),
})

const metaSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  image: z.string().optional(),
})

// ---------- Layout blocks used inside `pages.layout` ----------

const contentColumnSchema = z.object({
  size: z.enum(['oneThird', 'half', 'twoThirds', 'full']).default('oneThird'),
  richText: z.string().optional(), // markdown string (see note 1)
  link: linkSchema.optional(),
})

const blockSchema = z.discriminatedUnion('blockType', [
  z.object({
    blockType: z.literal('content'),
    columns: z.array(contentColumnSchema),
  }),
  z.object({
    blockType: z.literal('cta'),
    richText: z.string().optional(),
    links: z.array(linkSchema).max(2).optional(),
  }),
  z.object({
    blockType: z.literal('mediaBlock'),
    media: z.string(),
    mediaAlt: z.string().optional(),
  }),
  z.object({
    blockType: z.literal('archive'),
    introRichText: z.string().optional(),
    populateBy: z.enum(['collection', 'selection']).default('collection'),
    categories: z.array(reference('categories')).optional(),
    limit: z.number().default(10),
    selectedDocs: z.array(reference('posts')).optional(),
  }),
  z.object({
    blockType: z.literal('tabsBlock'),
    tabs: z
      .array(
        z.object({
          label: z.string(),
          listType: z.enum(['none', 'affiliatedGroups', 'tools']).default('none'),
          richText: z.string().optional(),
        }),
      )
      .min(2),
  }),
  z.object({
    blockType: z.literal('trainingSections'),
    heading: z.string(),
    intro: z.string().optional(),
    // Explicit selection, not "all trainings" -- a page can have more than
    // one trainingSections block (e.g. one per university), and each needs
    // to show only its own subset.
    trainings: z.array(reference('trainings')).optional(),
  }),
  z.object({
    blockType: z.literal('upcomingEvents'),
    heading: z.string().default('Upcoming Events'),
    limit: z.number().default(3),
    viewAllLink: z.string().default('/events'),
  }),
])

// ---------- Collections ----------

const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    hero: heroSchema,
    layout: z.array(blockSchema),
    meta: metaSchema.optional(),
    publishedAt: z.coerce.date().optional(),
    slug: z.string(),
  }),
})

const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    heroImage: z.string().optional(),
    heroImageAlt: z.string().optional(),
    // body of the .md file itself = the post's main rich text content
    relatedPosts: z.array(reference('posts')).optional(),
    categories: z.array(reference('categories')).optional(),
    authors: z.array(z.string()).optional(),
    publishedAt: z.coerce.date(),
    meta: metaSchema.optional(),
    slug: z.string(),
  }),
})

const events = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/events' }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    startDate: z.coerce.date(),
    startTime: z.string().optional(), // display-only, e.g. "12:15" -- not used for sorting/status
    endDate: z.coerce.date().optional(),
    endTime: z.string().optional(),
    location: z.string().optional(),
    isOnline: z.boolean().default(false),
    // body of the .md file = event description
    registrationUrl: z.string().optional(),
    featuredImage: z.string().optional(),
    relatedNode: reference('localOffices').optional(),
    // Upcoming/past is now computed at build time from startDate/endDate
    // (see src/lib/events.ts) instead of stored here -- "cancelled" is the
    // only state that genuinely can't be derived from a date.
    cancelled: z.boolean().optional(),
  }),
})

const localOffices = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/local-offices' }),
  schema: z.object({
    name: z.string(),
    slug: z.string(),
    logo: z.string().optional(),
    shortDescription: z.string().optional(),
    externalUrl: z.string().optional(),
    contacts: z
      .array(
        z.object({
          name: z.string(),
          photo: z.string().optional(),
          url: z.string().optional(),
          email: z.string().email().optional(),
          note: z.string().optional(),
        }),
      )
      .optional(),
  }),
})

const affiliatedGroups = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/affiliated-groups' }),
  schema: z.object({
    name: z.string(),
    logo: z.string().optional(),
    externalUrl: z.string(),
    // body of the .md file = group description
    expertise: z.array(z.string()).optional(),
    contactName: z.string().optional(),
    contactUrl: z.string().optional(),
    localOffice: reference('localOffices').optional(), // renamed from dariahNode
  }),
})

const tools = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/tools' }),
  schema: z.object({
    name: z.string(),
    // body of the .md file = tool description
    accessLinks: z
      .array(
        z.object({
          label: z.string().optional(),
          url: z.string(),
        }),
      )
      .optional(),
    tutorialUrl: z.string().optional(),
    contacts: z
      .array(
        z.object({
          name: z.string(),
          url: z.string().optional(),
        }),
      )
      .optional(),
    localOffice: reference('localOffices').optional(), // replaces developedBy (was a list; now a single office)
    collaborators: z.array(reference('localOffices')).optional(),
  }),
})

const categories = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/categories' }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
  }),
})

const trainings = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/trainings' }),
  schema: z.object({
    title: z.string(),
    url: z.string().optional(),
    // Section this training belongs to on the page (was groups[].levelLabel)
    group: z.string().optional(),
    levelTags: z.string().optional(),
    localOffice: reference('localOffices').optional(),
    // description lives in the file's body, same convention as posts/events/tools
  }),
})

// Header/Footer globals -- not repeated content, so they live in one JSON
// file (src/data/globals.json = { "header": {...}, "footer": {...} })
// rather than as markdown files. Astro's file() loader turns each top-level
// key into an entry, so this is fetched as getEntry('globals', 'header').
const globals = defineCollection({
  loader: file('./src/data/globals.json'),
  schema: z.object({
    navItems: z.array(linkSchema).max(6).optional(),
  }),
})

export const collections = {
  pages,
  posts,
  events,
  localOffices,
  affiliatedGroups,
  tools,
  categories,
  trainings,
  globals,
}