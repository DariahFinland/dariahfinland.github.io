// scripts/normalize-reference-paths.ts
//
// Ensures every reference-field value is written in the full path format
// PagesCMS's reference field now requires (value: "{path}" -- e.g.
// "src/content/local-offices/jyvaskyla.md"), converting any leftover bare
// slugs up to that format.
//
// Why this matters even though Astro's own resolution (src/lib/
// references.ts) already tolerates both formats: PagesCMS's own edit-form
// dropdown does NOT -- a bare-slug value shows as unselected/broken there,
// even though the live site renders fine. This fixes the CMS editing
// experience for content saved before the value: "{path}" config change.
//
// Usage:
//   pnpm tsx scripts/normalize-reference-paths.ts
//
// Safe to run more than once -- already-correct (full-path) values are
// left untouched.

import fs from 'node:fs'
import path from 'node:path'
import * as yaml from 'js-yaml'

const CONTENT_DIR = path.resolve(process.cwd(), 'src/content')

function toPath(slug: string, targetFolder: string): string {
  return `src/content/${targetFolder}/${slug}.md`
}

function isAlreadyPath(value: string): boolean {
  return /^src\/content\/[a-z0-9-]+\/.+\.md$/.test(value)
}

function normalizeField(value: unknown, targetFolder: string): { value: unknown; changed: boolean } {
  if (typeof value === 'string') {
    if (!value || isAlreadyPath(value)) return { value, changed: false }
    return { value: toPath(value, targetFolder), changed: true }
  }
  if (Array.isArray(value)) {
    let changed = false
    const newArr = value.map((item) => {
      const result = normalizeField(item, targetFolder)
      if (result.changed) changed = true
      return result.value
    })
    return { value: newArr, changed }
  }
  return { value, changed: false }
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

// Every flat (non-nested) reference field across all collections, and which
// target collection folder it points to.
const REFERENCE_FIELDS: { collection: string; field: string; target: string }[] = [
  { collection: 'posts', field: 'categories', target: 'categories' },
  { collection: 'posts', field: 'relatedPosts', target: 'posts' },
  { collection: 'events', field: 'localOffice', target: 'local-offices' },
  { collection: 'affiliated-groups', field: 'localOffice', target: 'local-offices' },
  { collection: 'tools', field: 'localOffice', target: 'local-offices' },
  { collection: 'tools', field: 'collaborators', target: 'local-offices' },
  { collection: 'trainings', field: 'localOffice', target: 'local-offices' },
]

function main() {
  let filesChanged = 0
  let valuesFixed = 0

  // ---------- flat, top-level reference fields ----------
  for (const { collection, field, target } of REFERENCE_FIELDS) {
    const dir = path.join(CONTENT_DIR, collection)
    if (!fs.existsSync(dir)) continue

    for (const file of fs.readdirSync(dir)) {
      if (!file.endsWith('.md')) continue
      const filePath = path.join(dir, file)
      const raw = fs.readFileSync(filePath, 'utf-8')
      const parsed = splitFrontmatter(raw)
      if (!parsed || !(field in parsed.frontmatter)) continue

      const result = normalizeField(parsed.frontmatter[field], target)
      if (result.changed) {
        parsed.frontmatter[field] = result.value
        fs.writeFileSync(filePath, writeFrontmatter(parsed.frontmatter, parsed.body))
        filesChanged++
        valuesFixed++
        console.log(`Fixed: ${collection}/${file} -> ${field}`)
      }
    }
  }

  // ---------- reference fields nested inside pages.layout blocks ----------
  const pagesDir = path.join(CONTENT_DIR, 'pages')
  if (fs.existsSync(pagesDir)) {
    for (const file of fs.readdirSync(pagesDir)) {
      if (!file.endsWith('.md')) continue
      const filePath = path.join(pagesDir, file)
      const raw = fs.readFileSync(filePath, 'utf-8')
      const parsed = splitFrontmatter(raw)
      if (!parsed || !Array.isArray(parsed.frontmatter.layout)) continue

      let anyChanged = false
      parsed.frontmatter.layout = parsed.frontmatter.layout.map((block: any) => {
        if (block.blockType === 'archive') {
          if (block.categories) {
            const r = normalizeField(block.categories, 'categories')
            if (r.changed) {
              block.categories = r.value
              anyChanged = true
            }
          }
          if (block.selectedDocs) {
            const r = normalizeField(block.selectedDocs, 'posts')
            if (r.changed) {
              block.selectedDocs = r.value
              anyChanged = true
            }
          }
        }
        if (block.blockType === 'trainingSections' && block.trainings) {
          const r = normalizeField(block.trainings, 'trainings')
          if (r.changed) {
            block.trainings = r.value
            anyChanged = true
          }
        }
        return block
      })

      if (anyChanged) {
        fs.writeFileSync(filePath, writeFrontmatter(parsed.frontmatter, parsed.body))
        filesChanged++
        valuesFixed++
        console.log(`Fixed: pages/${file} -> layout blocks`)
      }
    }
  }

  console.log(`\nDone. ${valuesFixed} field(s) fixed across ${filesChanged} file(s).`)
}

main()