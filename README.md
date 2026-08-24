# DARIAH-FI Website

A statically-generated version of the DARIAH-FI website, built with [Astro](https://astro.build) and edited through [PagesCMS](https://pagescms.org). Content lives as Markdown/JSON files in this repo instead of a database.

## Why this exists

The site previously ran on [Payload CMS](https://payloadcms.com) with a PostgreSQL database, hosted on Rahti (CSC's OpenShift-based platform). That stack needed a running backend and database just to serve pages.

This version removes that dependency entirely:

- **Content** is Markdown files (with YAML frontmatter) and one JSON file, committed to this repo.
- **PagesCMS** gives non-technical editors a form-based UI over those files — it commits directly to GitHub on save, so no one needs to know Git.
- **Astro** builds the whole site into static HTML at deploy time. No server, no database, nothing to keep running.
- **GitHub Actions** rebuilds and redeploys automatically on every push to `main` — including the commits PagesCMS makes.

```
Editor → PagesCMS → GitHub repo (this one) → GitHub Actions (astro build + pagefind)
                                                        ↓
                                              GitHub Pages (static hosting)
```

## Tech stack

| Piece | Tool |
|---|---|
| Site generator | [Astro](https://astro.build) (content collections, static output) |
| Content editing | [PagesCMS](https://pagescms.org) (`.pages.yml`) |
| Search | [Pagefind](https://pagefind.app) (indexes the built site at build time) |
| Hosting | GitHub Pages, deployed via GitHub Actions |
| Styling | Tailwind CSS v4, design tokens ported from the original site |

## Project structure

```
├── .pages.yml                  # PagesCMS config — defines every editable field
├── .github/workflows/deploy.yml
├── astro.config.mjs
├── src/
│   ├── content.config.ts       # Astro content collection schemas (source of truth)
│   ├── content/                # The actual content, one folder per collection
│   │   ├── pages/
│   │   ├── posts/
│   │   ├── events/
│   │   ├── local-offices/
│   │   ├── affiliated-groups/
│   │   ├── tools/
│   │   └── categories/
│   ├── data/
│   │   └── globals.json        # Header + footer nav (not a repeated collection)
│   ├── layouts/
│   │   └── BaseLayout.astro
│   ├── components/
│   │   ├── Header.astro / Footer.astro / Hero.astro
│   │   ├── RenderBlocks.astro  # Switches on a page's layout blocks
│   │   └── blocks/             # One component per block type
│   ├── lib/
│   │   └── markdown.ts         # Converts rich-text markdown strings to HTML
│   └── pages/
│       ├── [...slug].astro     # Every generic page
│       ├── contacts.astro      # Hardcoded route (not a content collection)
│       ├── search.astro        # Pagefind UI
│       └── posts/, events/, tools/, affiliated-groups/, local-offices/
└── public/
    └── media/                  # Uploaded images (originals only — see below)
```

## Content model

| Collection | What it is | Has its own page? |
|---|---|---|
| `pages` | Flexible pages built from layout blocks | Yes — `/[slug]` |
| `posts` | News/blog articles | Yes — `/posts/[slug]` |
| `events` | Upcoming and past events | Yes — `/events/[slug]` |
| `local-offices` | DARIAH-FI's national/local offices | Yes — `/local-offices/[slug]` |
| `affiliated-groups` | Partner research groups | No — shown via `TabsBlock` and inside local-office pages |
| `tools` | Tools/software listings | No — shown via `TabsBlock` and inside local-office pages |
| `categories` | Tags for filtering posts | No — used only to filter `posts` |
| `globals.json` (`header`/`footer`) | Site-wide navigation | N/A |

A `pages` document is built from **layout blocks** (`content`, `cta`, `mediaBlock`, `archive`, `tabsBlock`, `trainingSections`, `upcomingEvents`) — see `src/content.config.ts` for exact shapes, and `.pages.yml` for the matching editor fields. **These two files must be kept in sync** — if you add/change a field in one, mirror it in the other, or Astro will fail to validate content that PagesCMS happily saved.

## Getting started

```bash
pnpm install
pnpm dev        # local dev server — note: /search won't work here, see below
```

```bash
pnpm build      # astro build && pagefind indexing — this is what deploys
pnpm preview    # serves the built dist/ folder, including working search
```

## Editing content

Content is edited at [pagescms.org](https://pagescms.org), signed in with a GitHub account that has **write access to this repo**. PagesCMS reads `.pages.yml` from `main` and generates the editing UI from it automatically. Saving an edit commits directly to `main`, which triggers a rebuild and redeploy via GitHub Actions — typically live within a couple of minutes.

To give someone editing access: add them as a collaborator on this GitHub repo (Settings → Collaborators). No separate PagesCMS invite is needed — access is entirely governed by GitHub repo permissions, and anyone with write access will see the repo listed when they sign in.

## Search

Search is powered by Pagefind, which indexes the site's built HTML. **This only works after a full `pnpm build`** — `/search` will show a broken/empty search box under plain `pnpm dev`, since the index files don't exist until the build+index step runs. This isn't a bug; it's inherent to how Pagefind works.

## Known simplifications

A few things were deliberately simplified during migration, on purpose, to keep the initial build manageable. None of these are broken — they're just less than the original site did:

- **No shared media library.** Each image field stores its own path + alt text directly, rather than referencing a reusable "media item." Alt text has to be re-entered per use.
- **Events list has no pagination.** All events show at once, split into Upcoming/Past tabs.
- **Posts have no `relatedPosts` display** on the post detail page, even though the field exists in the schema.
- **No draft/preview workflow.** Every PagesCMS save goes straight to `main` and straight to production — there's no staging step. Worth revisiting if multiple editors start working concurrently.

## Gotchas worth remembering

A few things that broke during migration and are easy to reintroduce if this pattern isn't kept in mind for future changes:

- **`reference()` fields aren't plain strings.** A field like `categories: [news-and-blogs]` in frontmatter becomes `{ id: 'news-and-blogs', collection: 'categories' }` after Astro parses it. Comparing two reference values needs `.id === .id`, never direct equality or `.includes()` — the latter silently matches nothing.
- **Date fields need `z.coerce.date()`, not `z.date()`** — YAML frontmatter dates arrive as strings, and `z.date()` rejects them outright.
- **`blockKey: blockType` in `.pages.yml` must match `content.config.ts`'s `discriminatedUnion('blockType', ...)` exactly**, or PagesCMS and Astro disagree about how a page's layout blocks are tagged.
- **`public/media/` should only contain original files**, not Payload's auto-generated size variants (thumbnail/small/medium/etc.) — nothing in this site references those, and their sheer file count can break tooling that lists the whole directory (this is exactly what happened with PagesCMS's media browser).
- **Pin the pnpm version explicitly** — both locally (`packageManager` field in `package.json`) and understand that CI reads that same field. An unpinned/latest version can jump to a pnpm release that needs a newer Node than your workflow specifies.

## Original migration scripts

Two one-off scripts were used to migrate content out of Payload/Postgres. They live in the **original Payload project**, not this repo, since they need Payload's local API and database access:

- `scripts/export-to-markdown.ts` — pulls every document out of Postgres via Payload's local API and writes it as Markdown + frontmatter matching this repo's schema.
- `scripts/clean-media.ts` — removes Payload's auto-generated image size variants, keeping only original uploads.

Both are safe to re-run if a large re-import is ever needed again, but day-to-day editing should happen through PagesCMS, not these scripts.