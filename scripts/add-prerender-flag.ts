// scripts/add-prerender-flag.ts
//
// One-time migration: inserts `export const prerender = true` at the top
// of every page's frontmatter, right after the opening ---. Needed because
// under output: 'server' (required for Tina's on-demand editing routes),
// getStaticPaths() is ignored by default -- every page needs to opt back
// into build-time generation explicitly.
//
// Usage:
//   pnpm tsx scripts/add-prerender-flag.ts
//
// Safe to run more than once -- files that already have the flag are
// skipped, not double-inserted.

import fs from 'node:fs'
import path from 'node:path'

const PAGES_DIR = path.resolve(process.cwd(), 'src/pages')

const INSERT_BLOCK = `// This route now needs to opt back into build-time generation explicitly --
// under output: 'server' (needed for Tina's on-demand editing routes),
// getStaticPaths() is ignored by default, and pages render on-demand
// instead. prerender = true restores the original static-generation
// behavior for this specific route.
export const prerender = true

`

function findAstroFiles(dir: string): string[] {
  const results: string[] = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      results.push(...findAstroFiles(fullPath))
    } else if (entry.name.endsWith('.astro')) {
      results.push(fullPath)
    }
  }
  return results
}

function main() {
  const files = findAstroFiles(PAGES_DIR)
  console.log(`Found ${files.length} page file(s)`)

  let patched = 0
  let skipped = 0

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8')

    if (content.includes('export const prerender')) {
      console.log(`SKIP (already has it): ${path.relative(process.cwd(), file)}`)
      skipped++
      continue
    }

    const lines = content.split('\n')
    if (lines[0] !== '---') {
      console.warn(`WARNING: unexpected first line, skipping: ${path.relative(process.cwd(), file)}`)
      continue
    }

    const newContent = lines[0] + '\n' + INSERT_BLOCK + lines.slice(1).join('\n')
    fs.writeFileSync(file, newContent)
    console.log(`Patched: ${path.relative(process.cwd(), file)}`)
    patched++
  }

  console.log(`\nDone. ${patched} file(s) patched, ${skipped} already had it.`)
}

main()