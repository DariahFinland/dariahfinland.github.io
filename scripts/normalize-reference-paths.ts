// scripts/normalize-reference-paths.ts
//
// PagesCMS's reference field defaults to storing the full file path (e.g.
// "src/content/local-offices/jyvaskyla.md") instead of the plain slug
// ("jyvaskyla") that Astro's reference() fields expect. Run this once
// AFTER adding value: "{id}" to every reference field in .pages.yml --
// that stops it happening on future saves; this script fixes anything
// already saved with the broken format, across every collection and every
// field (including nested ones like pages > layout > tabsBlock, contacts
// lists, etc.), not just the ones you've noticed so far.
//
// Usage:
//   pnpm tsx scripts/normalize-reference-paths.ts
//
// Safe to run more than once -- already-correct values are left untouched.

import fs from 'node:fs'
import path from 'node:path'
import * as yaml from 'js-yaml'

const CONTENT_DIR = path.resolve(process.cwd(), 'src/content')
const PATH_PATTERN = /^src\/content\/[a-z0-9-]+\/(.+)\.md$/

function splitFrontmatter(raw: string): { frontmatter: Record<string, any>; body: string } | null {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)
  if (!match) return null
  return { frontmatter: (yaml.load(match[1]) as Record<string, any>) ?? {}, body: match[2] ?? '' }
}

function writeFrontmatter(frontmatter: Record<string, any>, body: string): string {
  const clean = Object.fromEntries(Object.entries(frontmatter).filter(([, v]) => v !== undefined && v !== null))
  return `---\n${yaml.dump(clean, { lineWidth: 100 })}---\n\n${body}`
}

// Recursively walks a value (string, array, or nested object -- e.g. a
// page's `layout` blocks) and fixes any string matching the bad-path
// pattern, wherever it's nested.
function normalizeValue(value: unknown): { value: unknown; changed: boolean } {
  if (typeof value === 'string') {
    const match = value.match(PATH_PATTERN)
    return match ? { value: match[1], changed: true } : { value, changed: false }
  }
  if (Array.isArray(value)) {
    let changed = false
    const newArr = value.map((item) => {
      const result = normalizeValue(item)
      if (result.changed) changed = true
      return result.value
    })
    return { value: newArr, changed }
  }
  if (value && typeof value === 'object') {
    let changed = false
    const newObj: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(value)) {
      const result = normalizeValue(v)
      if (result.changed) changed = true
      newObj[k] = result.value
    }
    return { value: newObj, changed }
  }
  return { value, changed: false }
}

function main() {
  const collections = fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => fs.statSync(path.join(CONTENT_DIR, f)).isDirectory())

  let filesChanged = 0
  let valuesFixed = 0

  for (const collection of collections) {
    const dir = path.join(CONTENT_DIR, collection)
    for (const file of fs.readdirSync(dir)) {
      if (!file.endsWith('.md')) continue
      const filePath = path.join(dir, file)
      const raw = fs.readFileSync(filePath, 'utf-8')
      const parsed = splitFrontmatter(raw)
      if (!parsed) continue

      let anyChanged = false
      const newFrontmatter: Record<string, unknown> = {}
      for (const [key, value] of Object.entries(parsed.frontmatter)) {
        const result = normalizeValue(value)
        if (result.changed) {
          anyChanged = true
          valuesFixed++
        }
        newFrontmatter[key] = result.value
      }

      if (anyChanged) {
        fs.writeFileSync(filePath, writeFrontmatter(newFrontmatter, parsed.body))
        filesChanged++
        console.log(`Fixed: ${collection}/${file}`)
      }
    }
  }

  console.log(`\nDone. ${valuesFixed} value(s) fixed across ${filesChanged} file(s).`)
}

main()
