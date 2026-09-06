// scripts/fix-time-yaml-quoting.ts
//
// YAML has a legacy quirk: an unquoted value shaped like "HH:MM" (e.g.
// 11:00) gets parsed as a "sexagesimal" number (11:00 -> 660), not the
// string it looks like. Every startTime/endTime value written by hand (or
// by an early version of the export script, before this was known) is at
// risk of this -- and it's exactly the kind of type mismatch that crashes
// TinaCMS's indexer, since that field is declared as type: string there.
//
// This finds every event with a startTime/endTime that YAML parsed as a
// number, and rewrites it back to the intended zero-padded "HH:MM" string,
// quoted so this can never happen again on that file.
//
// Usage:
//   pnpm tsx scripts/fix-time-yaml-quoting.ts
//
// Safe to run more than once -- files with already-correct string values
// are left untouched.

import fs from 'node:fs'
import path from 'node:path'
import * as yaml from 'js-yaml'

const EVENTS_DIR = path.resolve(process.cwd(), 'src/content/events')

function splitFrontmatter(raw: string): { frontmatter: Record<string, any>; body: string } | null {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)
  if (!match) return null
  return { frontmatter: (yaml.load(match[1]) as Record<string, any>) ?? {}, body: match[2] ?? '' }
}

function writeFrontmatter(frontmatter: Record<string, any>, body: string): string {
  const clean = Object.fromEntries(Object.entries(frontmatter).filter(([, v]) => v !== undefined && v !== null))
  return `---\n${yaml.dump(clean, { lineWidth: 100 })}---\n\n${body}`
}

// A number that came from parsing "H:MM" or "HH:MM" as sexagesimal is
// always minutes-since-midnight (0-1439). Reconstruct the original
// "HH:MM" string from it.
function numberToTimeString(n: number): string {
  const hours = Math.floor(n / 60)
  const minutes = n % 60
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

function main() {
  let filesChanged = 0
  let fieldsFixed = 0

  for (const file of fs.readdirSync(EVENTS_DIR)) {
    if (!file.endsWith('.md')) continue
    const filePath = path.join(EVENTS_DIR, file)
    const raw = fs.readFileSync(filePath, 'utf-8')
    const parsed = splitFrontmatter(raw)
    if (!parsed) continue

    let changed = false
    for (const field of ['startTime', 'endTime']) {
      const value = parsed.frontmatter[field]
      if (typeof value === 'number') {
        const fixed = numberToTimeString(value)
        console.log(`${file}: ${field} ${value} -> "${fixed}"`)
        parsed.frontmatter[field] = fixed
        changed = true
        fieldsFixed++
      }
    }

    if (changed) {
      fs.writeFileSync(filePath, writeFrontmatter(parsed.frontmatter, parsed.body))
      filesChanged++
    }
  }

  console.log(`\nDone. ${fieldsFixed} field(s) fixed across ${filesChanged} file(s).`)
}

main()