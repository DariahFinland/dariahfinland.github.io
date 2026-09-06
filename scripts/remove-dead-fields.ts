// scripts/remove-dead-fields.ts
//
// Several fields were deliberately removed from the schema over time
// (slug -> replaced by auto-generated filenames; order -> replaced by
// alphabetical sorting; status -> replaced by the cancelled boolean +
// computed upcoming/past). Astro/Zod silently ignores leftover unknown
// frontmatter keys, so old files never got cleaned up and this never
// caused a problem -- until TinaCMS's indexer, which is stricter and
// chokes on fields it doesn't recognize in its schema.
//
// This sweeps every collection for the exact fields we know were removed
// and deliberately dropped, and strips them if still present.
//
// Usage:
//   pnpm tsx scripts/remove-dead-fields.ts
//
// Safe to run more than once -- files without any dead fields are left
// untouched entirely (not even rewritten).

import fs from 'node:fs'
import path from 'node:path'
import * as yaml from 'js-yaml'

const CONTENT_DIR = path.resolve(process.cwd(), 'src/content')

// collection folder -> dead field names to strip if present
const DEAD_FIELDS: Record<string, string[]> = {
  posts: ['slug'],
  events: ['slug', 'status'],
  'local-offices': ['slug', 'order'],
  tags: ['slug'],
  'affiliated-groups': ['order'],
  trainings: ['order'],
  // pages.slug is NOT listed -- that one is still genuinely used for routing
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
  let filesChanged = 0
  let fieldsRemoved = 0

  for (const [collection, deadFields] of Object.entries(DEAD_FIELDS)) {
    const dir = path.join(CONTENT_DIR, collection)
    if (!fs.existsSync(dir)) continue

    for (const file of fs.readdirSync(dir)) {
      if (!file.endsWith('.md')) continue
      const filePath = path.join(dir, file)
      const raw = fs.readFileSync(filePath, 'utf-8')
      const parsed = splitFrontmatter(raw)
      if (!parsed) continue

      const present = deadFields.filter((f) => f in parsed.frontmatter)
      if (present.length === 0) continue

      for (const field of present) {
        delete parsed.frontmatter[field]
        fieldsRemoved++
      }

      fs.writeFileSync(filePath, writeFrontmatter(parsed.frontmatter, parsed.body))
      filesChanged++
      console.log(`Cleaned ${collection}/${file}: removed [${present.join(', ')}]`)
    }
  }

  console.log(`\nDone. ${fieldsRemoved} dead field(s) removed across ${filesChanged} file(s).`)
}

main()