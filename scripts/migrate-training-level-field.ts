// scripts/migrate-training-level-field.ts
//
// Replaces normalize-training-groups.ts (run this instead, not both).
// Does three things to every training file in one pass:
//   1. Normalizes the level value against the canonical four (fixing
//      casing, and mapping anything mentioning two levels -- e.g.
//      "Master's/Bachelor's level" -- to "Varied levels")
//   2. Renames the frontmatter key from `group` to `level` (the schema and
//      .pages.yml now both use `level` -- existing content still has the
//      old key name, which the renamed schema won't recognize at all)
//   3. Removes `levelTags` entirely -- that field no longer exists in the
//      schema
//
// Usage:
//   pnpm tsx scripts/migrate-training-level-field.ts
//
// Safe to run more than once -- already-migrated files (level key present,
// no group/levelTags keys) are left untouched.

import fs from 'node:fs'
import path from 'node:path'
import * as yaml from 'js-yaml'

const TRAININGS_DIR = path.resolve(process.cwd(), 'src/content/trainings')

const CANONICAL = ["Bachelor's level", "Master's level", 'Doctoral level', 'Varied levels']

function splitFrontmatter(raw: string): { frontmatter: Record<string, any>; body: string } | null {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)
  if (!match) return null
  return { frontmatter: (yaml.load(match[1]) as Record<string, any>) ?? {}, body: match[2] ?? '' }
}

function writeFrontmatter(frontmatter: Record<string, any>, body: string): string {
  const clean = Object.fromEntries(Object.entries(frontmatter).filter(([, v]) => v !== undefined && v !== null))
  return `---\n${yaml.dump(clean, { lineWidth: 100 })}---\n\n${body}`
}

// Tries to resolve a non-matching value to a canonical one. Returns
// undefined if it's not confident enough to guess.
function resolve(value: string): string | undefined {
  const trimmed = value.trim()

  const caseMatch = CANONICAL.find((c) => c.toLowerCase() === trimmed.toLowerCase())
  if (caseMatch) return caseMatch

  const levelWords = ['bachelor', 'master', 'doctoral', 'phd']
  const mentioned = levelWords.filter((w) => trimmed.toLowerCase().includes(w))
  if (mentioned.length >= 2) return 'Varied levels'

  return undefined
}

function main() {
  let migrated = 0
  let flagged = 0
  let skipped = 0

  for (const file of fs.readdirSync(TRAININGS_DIR)) {
    if (!file.endsWith('.md')) continue
    const filePath = path.join(TRAININGS_DIR, file)
    const raw = fs.readFileSync(filePath, 'utf-8')
    const parsed = splitFrontmatter(raw)
    if (!parsed) continue

    const hasOldFields = 'group' in parsed.frontmatter || 'levelTags' in parsed.frontmatter
    if (!hasOldFields) {
      skipped++
      continue // already migrated
    }

    const rawValue = parsed.frontmatter.group
    let resolvedLevel: string | undefined

    if (rawValue) {
      resolvedLevel = CANONICAL.includes(rawValue) ? rawValue : resolve(rawValue)
      if (!resolvedLevel) {
        console.warn(`NEEDS MANUAL FIX -- ${file}: group is "${rawValue}", doesn't match any canonical value and isn't an obvious multi-level case. Leaving group/levelTags in place until you fix this by hand.`)
        flagged++
        continue
      }
    }

    delete parsed.frontmatter.group
    delete parsed.frontmatter.levelTags
    if (resolvedLevel) parsed.frontmatter.level = resolvedLevel

    fs.writeFileSync(filePath, writeFrontmatter(parsed.frontmatter, parsed.body))
    console.log(`Migrated ${file}${rawValue && rawValue !== resolvedLevel ? ` ("${rawValue}" -> "${resolvedLevel}")` : ''}`)
    migrated++
  }

  console.log(`\nDone. ${migrated} migrated, ${skipped} already up to date, ${flagged} need manual review.`)
  if (flagged > 0) {
    console.log('Fix the flagged ones by hand (edit the group: line directly, or re-save through PagesCMS once the new field is live), then re-run this script.')
  }
}

main()