# DARIAH-FI Website

A statically-generated version of the DARIAH-FI website, built with [Astro](https://astro.build) and edited through [PagesCMS](https://pagescms.org). Content lives as Markdown/JSON files in this repo instead of a database.

## Why this exists

The site previously ran on [Payload CMS](https://payloadcms.com) with a PostgreSQL database, hosted on Rahti (CSC's OpenShift-based platform). That stack needed a running backend and database just to serve pages.

This version removes that dependency entirely:

- **Content** is Markdown files (with YAML frontmatter) and one JSON file, committed to this repo.
- **PagesCMS** gives non-technical editors a form-based UI over those files — it commits directly to GitHub on save, so no one needs to know Git.
- **Astro** builds the whole site into static HTML at deploy time. No server, no database, nothing to keep running.
- **GitHub Actions** rebuilds and redeploys to **GitHub Pages** automatically on every push to `main` — including the commits PagesCMS makes.

```
Editor → PagesCMS → GitHub repo (this one, main branch)
                              ↓ (push triggers)
                    GitHub Actions: astro build + pagefind indexing
                              ↓
                        GitHub Pages (static hosting)
```

The site is hosted at the repo's own root (`<org>.github.io`, no subpath) — this matters because the whole codebase uses root-relative paths (`/media/...`, `/posts/...`, etc.) throughout, which only resolve correctly without a path prefix.

## Tech stack

| Piece | Tool |
|---|---|
| Site generator | [Astro](https://astro.build) (content collections, static output) |
| Content editing | [PagesCMS](https://pagescms.org) (`.pages.yml`), connected directly to `main` |
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
│   │   ├── trainings/
│   │   └── categories/
│   ├── data/
│   │   └── globals.json        # Header + footer nav (not a repeated collection)
│   ├── layouts/
│   │   └── BaseLayout.astro
│   ├── components/
│   │   ├── Header.astro        # Includes mobile hamburger menu + search icon
│   │   ├── Footer.astro        # Bluesky/YouTube links render as icons automatically
│   │   ├── Hero.astro
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
    └── media/                  # Uploaded images — originals only, see below
```

## Content model

| Collection | What it is | Has its own page? | Sort order |
|---|---|---|---|
| `pages` | Flexible pages built from layout blocks | Yes — `/[slug]` | — |
| `posts` | News/blog articles | Yes — `/posts/[slug]` | Newest first |
| `events` | Upcoming and past events | Yes — `/events/[slug]` | Soonest first (upcoming), most recent first (past) |
| `local-offices` | DARIAH-FI's national/local offices | Yes — `/local-offices/[slug]` | Alphabetical |
| `affiliated-groups` | Partner research groups | No — shown via `TabsBlock` and inside local-office pages | Alphabetical |
| `tools` | Tools/software listings | No — shown via `TabsBlock` and inside local-office pages | Alphabetical |
| `trainings` | Individual training courses | No — shown via `trainingSections` blocks on the Training and Teaching page | Alphabetical within each section |
| `categories` | Tags for filtering posts | No — used only to filter `posts` | — |
| `globals.json` (`header`/`footer`) | Site-wide navigation | N/A | — |

There's no manual `order` field on any collection anymore — everything that isn't inherently time-ordered (posts, events) sorts alphabetically by name/title. This was a deliberate change: a hand-maintained ordering number was confusing for editors to keep consistent, and alphabetical needs no upkeep.

A `pages` document is built from **layout blocks** (`content`, `cta`, `mediaBlock`, `archive`, `tabsBlock`, `trainingSections`, `upcomingEvents`) — see `src/content.config.ts` for exact shapes, and `.pages.yml` for the matching editor fields. **These two files must be kept in sync** — if you add/change a field in one, mirror it in the other, or Astro will fail to validate content that PagesCMS happily saved.

### The `trainingSections` block, specifically

A page can have **more than one** `trainingSections` block — the Training and Teaching page has one per university/organisation. Each block has its own explicit `trainings` field (a list of references into the `trainings` collection) specifying exactly which courses that block shows, grouped by each training's `group` field (e.g. "Bachelor's level") and always displayed in the fixed order Bachelor's → Master's → Doctoral → Varied, regardless of content order.

This is deliberately **not** "query the whole `trainings` collection" — an earlier version did that and caused every training to show up under every block. Each block only ever renders what's explicitly selected in its own `trainings` field.

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

To give someone editing access: add them as a collaborator on this GitHub repo (Settings → Collaborators). No separate PagesCMS invite is needed — access is entirely governed by GitHub repo permissions, and anyone with write access will see the repo listed when they sign in. Note that GitHub's Collaborator permission is repo-wide — there's no built-in way to grant someone content-editing access without also giving them access to the code/workflow files.

## Deployment

Deploys via `.github/workflows/deploy.yml` on every push to `main`. A few things specific to this setup:

- The repo is named `<org-or-username>.github.io` so it serves from the domain root with no subpath — required because the whole site uses hardcoded root-relative paths that don't account for a subpath prefix.
- GitHub Pages is configured to deploy via **GitHub Actions**, not "Deploy from a branch" (Settings → Pages → Source) — this also means Jekyll processing is skipped entirely, so it won't interfere with the `pagefind/` output folder.
- `pnpm`'s version is pinned via the `packageManager` field in `package.json`, and CI runs on **Node 22** (not 20) — pnpm's more recent major versions need `node:sqlite`, which only exists from Node 22.5 onward.

## Search

Search is powered by Pagefind, which indexes the site's built HTML. **This only works after a full `pnpm build`** — `/search` will show a broken/empty search box under plain `pnpm dev`, since the index files don't exist until the build+index step runs. This isn't a bug; it's inherent to how Pagefind works.

## Known simplifications

A few things were deliberately simplified during migration, on purpose, to keep the initial build manageable. None of these are broken — they're just less than the original site did:

- **No shared media library.** Each image field stores its own path + alt text directly, rather than referencing a reusable "media item." Alt text has to be re-entered per use.
- **Events list has no pagination.** All events show at once, split into Upcoming/Past tabs (client-side toggle, not a URL parameter — so there's no shareable link directly to the "past" view).
- **Posts have no `relatedPosts` display** on the post detail page, even though the field exists in the schema.
- **No draft/preview workflow.** Every PagesCMS save goes straight to `main` and straight to production — there's no staging step. Worth revisiting if multiple editors start working concurrently.
- **Public media folder should only contain original uploads**, not Payload's old auto-generated size variants — see `scripts/clean-media.ts` below if this ever needs re-doing.

## Gotchas worth remembering

A few things that broke during migration and are easy to reintroduce if this pattern isn't kept in mind for future changes:

- **`reference()` fields aren't plain strings once parsed.** A field like `categories: [news-and-blogs]` in frontmatter becomes `{ id: 'news-and-blogs', collection: 'categories' }` after Astro parses it. Comparing two reference values needs `.id === .id`, never direct equality or `.includes()` — the latter silently matches nothing. Frontmatter itself should still be written as the plain string slug — Astro does the object conversion, not you.
- **A block type used more than once on the same page needs its own explicit content selection, not a global collection query.** This bit us with `trainingSections`: querying the whole `trainings` collection from inside the component made every instance of the block show everything. Each block needs a `reference()` field (like `Archive`'s `selectedDocs`) scoping it to only its own content.
- **Date fields need `z.coerce.date()`, not `z.date()`** — YAML frontmatter dates arrive as strings, and `z.date()` rejects them outright.
- **`blockKey: blockType` in `.pages.yml` must match `content.config.ts`'s `discriminatedUnion('blockType', ...)` exactly**, or PagesCMS and Astro disagree about how a page's layout blocks are tagged.
- **`public/media/` should only contain original files**, not Payload's auto-generated size variants (thumbnail/small/medium/etc.) — nothing in this site references those, and their sheer file count can break tooling that lists the whole directory (this is exactly what happened with PagesCMS's media browser hitting a ~1,000-file limit).
- **Pin the pnpm version explicitly** via `packageManager` in `package.json`, and keep it consistent with the Node version in CI — pnpm's own minimum Node requirement has moved forward across major versions.

## Migration scripts

These were used to bring content over from the old Payload/Postgres site, and later to restructure Training and Teaching into its own collection. Day-to-day editing should happen through PagesCMS, not these scripts — they're one-off tools, kept here for reference in case a similar bulk change is ever needed again.

**Live in the original Payload project** (need Payload's local API + database access):

- `scripts/export-to-markdown.ts` — pulls every document out of Postgres and writes it as Markdown + frontmatter matching this repo's schema.
- `scripts/clean-media.ts` — removes Payload's auto-generated image size variants, keeping only original uploads.

**Live in this Astro repo** (only touch files already here):

- `scripts/migrate-trainings.ts` — extracted the old inline `trainingSections` block data (nested `groups`/`courses`) out into individual `trainings/*.md` files.
- `scripts/link-trainings-to-blocks.ts` — reconstructed which `trainings` entries belong to which `trainingSections` block, by reading the live site's rendered HTML and matching course titles.