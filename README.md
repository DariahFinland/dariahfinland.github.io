# DARIAH-FI Website

A statically-generated version of the DARIAH-FI website, built with [Astro](https://astro.build) and edited through [PagesCMS](https://pagescms.org). Content lives as Markdown files (and one JSON file) in this repo instead of a database.

## Why this exists

The site previously ran on [Payload CMS](https://payloadcms.com) with a PostgreSQL database, hosted on Rahti (CSC's OpenShift-based platform). That stack needed a running backend and database just to serve pages.

This version removes that dependency entirely:

- **Content** is Markdown files (with YAML frontmatter) and one JSON file, committed to this repo.
- **PagesCMS** gives editors a form-based UI over those files — no Git knowledge needed. Edits land on a `staging` branch first; a **Publish** button inside PagesCMS itself promotes them to `main` when the editor is happy with how they look.
- **Astro** builds the whole site into static HTML at deploy time. No server, no database, nothing to keep running.
- **Cloudflare** (Workers, serving static assets) builds and deploys automatically on every push — production from `main`, and a live preview URL for `staging` and any other branch, with zero extra configuration.

```
Editor → PagesCMS (edits land on `staging`)
              ↓ (Cloudflare auto-builds every branch)
      staging preview URL ← editor checks their own change
              ↓ (editor clicks "Publish to Live Site" in PagesCMS)
      GitHub Actions fast-forwards main to match staging
              ↓
      Cloudflare deploys main to production
```

A daily scheduled GitHub Action also pings Cloudflare to trigger a fresh production build even with zero content changes — this is what makes event statuses (upcoming/past) update automatically, since that's computed from the current date at build time, not stored as a field editors maintain by hand.

## Tech stack

| Piece | Tool |
|---|---|
| Site generator | [Astro](https://astro.build) (content collections, static output) |
| Content editing | [PagesCMS](https://pagescms.org) (`.pages.yml`), editing `staging`, publishing to `main` via a custom action |
| Search | [Pagefind](https://pagefind.app) (indexes the built site at build time) |
| Hosting | Cloudflare (Workers, static assets) — see `wrangler.jsonc` |
| Analytics | [GoatCounter](https://www.goatcounter.com) (privacy-friendly, no cookie banner needed) |
| Styling | Tailwind CSS v4, design tokens ported from the original site |

## Project structure

```
├── .pages.yml                    # PagesCMS config — defines every editable field
├── wrangler.jsonc                 # Cloudflare deployment config (points at dist/)
├── pnpm-workspace.yaml            # pnpm 11 install-script allowlist (see Gotchas)
├── .github/workflows/
│   ├── publish.yml                # Fast-forwards main -> triggered by PagesCMS's Publish button
│   └── scheduled-rebuild.yml      # Daily cron -> pings Cloudflare to rebuild main
├── scripts/                        # One-off migration scripts, see below
├── astro.config.mjs
├── src/
│   ├── content.config.ts          # Astro content collection schemas (source of truth)
│   ├── content/                   # The actual content, one folder per collection
│   │   ├── pages/
│   │   ├── posts/
│   │   ├── events/
│   │   ├── local-offices/
│   │   ├── affiliated-groups/
│   │   ├── tools/
│   │   ├── trainings/
│   │   └── tags/
│   ├── data/
│   │   └── globals.json           # Header + footer nav (not a repeated collection)
│   ├── layouts/
│   │   └── BaseLayout.astro       # Includes GoatCounter (production only)
│   ├── components/
│   │   ├── Header.astro           # Mobile hamburger menu + search icon
│   │   ├── Footer.astro           # Bluesky/YouTube links render as icons automatically
│   │   ├── Hero.astro
│   │   ├── RenderBlocks.astro     # Switches on a page's layout blocks
│   │   └── blocks/                # One component per block type
│   ├── lib/
│   │   ├── markdown.ts            # Converts rich-text markdown strings to HTML
│   │   ├── references.ts          # Resolves/compares reference fields (see Gotchas)
│   │   └── events.ts              # Computes upcoming/past + formats event dates
│   └── pages/
│       ├── [...slug].astro        # Every generic page
│       ├── contacts.astro         # Hardcoded route (not a content collection)
│       ├── search.astro           # Pagefind UI
│       └── posts/, events/, tools/, affiliated-groups/, local-offices/
└── public/
    └── media/                     # Uploaded images — originals only, see below
```

## Content model

| Collection | What it is | Has its own page? | Sort order |
|---|---|---|---|
| `pages` | Flexible pages built from layout blocks | Yes — `/[slug]` | — |
| `posts` | News/blog articles | Yes — `/posts/[slug]` | Newest first |
| `events` | Upcoming and past events | Yes — `/events/[slug]` | Soonest first (upcoming), most recent first (past) |
| `local-offices` | DARIAH-FI's national/local offices | Yes — `/local-offices/[slug]` | Alphabetical |
| `affiliated-groups` | Partner research groups | No — shown via `tabsBlock` and inside local-office pages | Alphabetical |
| `tools` | Tools/software listings | No — shown via `tabsBlock` and inside local-office pages | Alphabetical |
| `trainings` | Individual training courses | No — shown via `trainingSections` blocks and inside local-office pages | Alphabetical |
| `tags` | Shared tags — used by `posts` and by `affiliated-groups.expertise` | No — used only to filter/label other content | — |
| `globals.json` (`header`/`footer`) | Site-wide navigation | N/A | — |

None of these collections have a manually-maintained `order` field — everything that isn't inherently time-ordered sorts alphabetically, which needs no editor upkeep.

Four collections (`local-offices`, `affiliated-groups`, `tools`, `trainings`, `events`) share a `localOffice` reference field, tying them to the office they belong to — this powers each local office's detail page, which lists its own affiliated groups, tools, and trainings automatically.

A `pages` document is built from **layout blocks** (`content`, `cta`, `mediaBlock`, `archive`, `tabsBlock`, `trainingSections`, `upcomingEvents`) — see `src/content.config.ts` for exact shapes, and `.pages.yml` for the matching editor fields. **These two files must be kept in sync** — if you add/change a field in one, mirror it in the other, or Astro will fail to validate content that PagesCMS happily saved.

A page can have **more than one** `trainingSections` block (the Training and Teaching page has one per university). Each block has its own explicit `trainings` reference list — deliberately not "query the whole collection," since that caused every training to show up under every block early on.

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

Content is edited at [pagescms.org](https://pagescms.org), signed in with a GitHub account that has **write access to this repo**. PagesCMS reads `.pages.yml` from the `staging` branch (that's the branch it's configured to point at) and generates the editing UI from it automatically.

The workflow:
1. Editor saves changes in PagesCMS — commits land on `staging`.
2. Cloudflare automatically builds a live preview for `staging` (no config needed — every branch gets one).
3. Editor checks their change on that preview URL.
4. Happy with it? They click **Publish to Live Site**, a button inside PagesCMS's own sidebar (defined under `actions:` in `.pages.yml`). This triggers `.github/workflows/publish.yml`, which fast-forwards `main` to match `staging`.
5. Cloudflare deploys `main` to production automatically.

No PR, no merge UI, no second person required — entirely self-service. To give someone editing access: add them as a collaborator on this GitHub repo (Settings → Collaborators) — access is governed entirely by GitHub repo permissions, no separate PagesCMS invite needed.

Several fields have a `description` hint showing editors the live URL pattern for that entry (combined with the visible filename, shown thanks to `filename: { field: true }` in `.pages.yml`) — `tags`, `affiliated-groups`, `tools`, and `trainings` don't have their own standalone pages, so no such hint applies to them.

## Deployment

Deploys via Cloudflare's native Git integration (Workers, serving static assets) — **not** GitHub Actions, which only handles the two smaller jobs described above (publishing, and the scheduled rebuild). `wrangler.jsonc` is what tells Cloudflare where the built site lives (`./dist`); no server-side Worker code runs, since this is a fully static build.

Build settings (set once in Cloudflare's dashboard, not version-controlled): build command `pnpm build`, production branch `main`, non-production branch builds enabled (this is what gives `staging` its preview URL).

## Search

Search is powered by Pagefind, which indexes the site's built HTML. **This only works after a full `pnpm build`** — `/search` will show a broken/empty search box under plain `pnpm dev`, since the index files don't exist until the build+index step runs.

## Known simplifications

- **No shared media library.** Each image field stores its own path + alt text directly, rather than referencing a reusable "media item." Alt text has to be re-entered per use.
- **Events list has no pagination.** All events show at once, split into Upcoming/Past tabs (client-side toggle, not a URL parameter — no shareable link directly to the "past" view).
- **Posts have no `relatedPosts` display** on the post detail page, even though the field exists in the schema.
- **`public/media/` should only contain original uploads**, not any auto-generated size variants from the old CMS.

## Gotchas worth remembering

- **`reference()` fields aren't plain strings once parsed.** A field like `tags: [digital-humanities]` in frontmatter becomes an object after Astro parses it. Comparing two reference values needs `.id === .id` via the helpers in `src/lib/references.ts`, never direct equality.
- **PagesCMS's reference field only works correctly (dropdown + search) with `value: "{path}"` in its config** — storing the full file path (`src/content/tags/x.md`), not a bare slug. Every reference field in `.pages.yml` needs this set explicitly.
- **A block type used more than once on the same page needs its own explicit content selection**, not a query against the whole collection — see the `trainingSections` note above.
- **Unquoted `HH:MM`-shaped values in YAML frontmatter get parsed as numbers**, not strings (`11:00` → `660`, a YAML sexagesimal quirk) — this is why `startTime`/`endTime` on events are `select` fields with a fixed list of times in `.pages.yml`, not free text.
- **PagesCMS's custom `actions` (like the Publish button) send a `payload` input to `workflow_dispatch` automatically** — any workflow they trigger must declare `payload` under `inputs:`, even if unused, or GitHub rejects the dispatch call entirely.
- **`blockKey: blockType` in `.pages.yml` must match `content.config.ts`'s `discriminatedUnion('blockType', ...)` exactly**, or PagesCMS and Astro disagree about how a page's layout blocks are tagged.
- **Pin the pnpm version explicitly** via `packageManager` in `package.json`. Separately, `pnpm-workspace.yaml`'s `allowBuilds` list needs `esbuild: true` — this is a core Vite/Astro build dependency, not something specific to any one tool, and removing it breaks the build entirely with a cryptic `ERR_PNPM_IGNORED_BUILDS` error.
- **`astro.config.mjs`'s `site` field may be stale** — it should match wherever the site is actually deployed; worth double-checking it reflects the current Cloudflare URL rather than a leftover from an earlier hosting setup.

## Migration scripts

These were used for one-off content migrations and restructuring. Day-to-day editing should happen through PagesCMS, not these scripts — they're kept here for reference in case a similar bulk change is ever needed again.

- `scripts/migrate-trainings.ts` — extracted inline `trainingSections` block data into individual `trainings/*.md` files.
- `scripts/link-trainings-to-blocks.ts` — reconstructed which `trainings` entries belong to which `trainingSections` block by reading the live site's rendered HTML.
- `scripts/migrate-expertise-to-tags.ts` — migrated `affiliated-groups.expertise` from free-text strings to references into the `tags` collection.
- `scripts/normalize-reference-paths.ts` — fixes reference field values saved in the wrong format (bare slug vs. full path) back to what PagesCMS/Astro actually expect.

Two earlier scripts (`export-to-markdown.ts`, `clean-media.ts`) live in the **original Payload project**, not this repo, since they needed Payload's local API and database access to pull content out of Postgres in the first place.