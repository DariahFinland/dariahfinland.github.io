// scripts/migrate-expertise-to-tags.ts
//
// Run this AFTER renaming src/content/categories/ to src/content/tags/ and
// updating content.config.ts (categories -> tags). It:
//   1. Scans every affiliated-group's `expertise` field for free-text tag
//      values (e.g. "text reuse", "network analysis")
//   2. Creates a tags/*.md file for each unique value not already present
//      (existing tags -- former "categories" used by posts -- are left
//      alone and simply reused if a name happens to match)
//   3. Rewrites each affiliated-group's `expertise` field to hold reference
//      values in the {path} format PagesCMS's reference field needs (e.g.
//      "src/content/tags/text-reuse.md"), matching the same convention as
//      normalize-reference-paths.ts
//
// Usage:
//   pnpm tsx scripts/migrate-expertise-to-tags.ts
//
// Safe to run more than once -- already-migrated (path-format) expertise
// values and already-existing tags are left untouched.

import fs from 'node:fs'
import path from 'node:path'
import * as yaml from 'js-yaml'

const TAGS_DIR = path.resolve(process.cwd(), 'src/content/tags')
const GROUPS_DIR = path.resolve(process.cwd(), 'src/content/affiliated-groups')

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function isAlreadyPath(value: string): boolean {
  return /^src\/content\/[a-z0-9-]+\/.+\.md$/.test(value)
}

function splitFrontmatter(raw: string): { frontmatter: Record<string, any>; body: string } | null {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)
  if (!match) return null
  return { frontmatter: (yaml.load(match[1]) as Record<string, any>) ?? {}, body: match[2] ?? '' }
}

function writeFrontmatter(frontmatter: Record<string, any>, body: string): string {
  const clean = Object.fromEntries(Object.entries(frontmatter).filter(([, v]) => v !== undefined && v !== null))
  return `---\n${yaml.dump(clean, { lineWidth: 100 })}---\n\n${body}`
}

function main() {
  if (!fs.existsSync(TAGS_DIR)) {
    console.error(`${TAGS_DIR} does not exist -- rename src/content/categories/ to src/content/tags/ first.`)
    process.exit(1)
  }

  // Existing tag titles -> slug, so we reuse a tag if one already matches
  const existingTagSlugs = new Set(
    fs.readdirSync(TAGS_DIR).filter((f) => f.endsWith('.md')).map((f) => f.replace(/\.md$/, '')),
  )

  let tagsCreated = 0
  let groupsUpdated = 0

  for (const file of fs.readdirSync(GROUPS_DIR)) {
    if (!file.endsWith('.md')) continue
    const filePath = path.join(GROUPS_DIR, file)
    const raw = fs.readFileSync(filePath, 'utf-8')
    const parsed = splitFrontmatter(raw)
    if (!parsed || !Array.isArray(parsed.frontmatter.expertise)) continue

    let changed = false
    const newExpertise = parsed.frontmatter.expertise.map((value: string) => {
      if (!value || isAlreadyPath(value)) return value // already migrated

      const slug = slugify(value)
      if (!existingTagSlugs.has(slug)) {
        fs.writeFileSync(
          path.join(TAGS_DIR, `${slug}.md`),
          writeFrontmatter({ title: value, slug }, ''),
        )
        existingTagSlugs.add(slug)
        tagsCreated++
        console.log(`Created tag: ${slug} ("${value}")`)
      }

      changed = true
      return `src/content/tags/${slug}.md`
    })

    if (changed) {
      parsed.frontmatter.expertise = newExpertise
      fs.writeFileSync(filePath, writeFrontmatter(parsed.frontmatter, parsed.body))
      groupsUpdated++
      console.log(`Updated: affiliated-groups/${file}`)
    }
  }

  console.log(`\nDone. ${tagsCreated} tag(s) created, ${groupsUpdated} affiliated-group file(s) updated.`)
}

main()