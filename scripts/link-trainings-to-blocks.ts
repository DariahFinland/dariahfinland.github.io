// scripts/link-trainings-to-blocks.ts
//
// Reconstructs which `trainings` entries belong to which trainingSections
// block on a page, by reading the ALREADY-DEPLOYED live page (which still
// shows the correct per-university grouping via each block's `heading`)
// and matching course titles against your src/content/trainings/*.md files.
//
// This works because migrate-trainings.ts already preserved each block's
// original heading correctly (e.g. "University of Helsinki") -- only the
// new `trainings` selection field is missing. No git history needed.
//
// Usage:
//   pnpm add -D node-html-parser
//   pnpm tsx scripts/link-trainings-to-blocks.ts <page-filename-without-.md> <live-url>
//
// Example:
//   pnpm tsx scripts/link-trainings-to-blocks.ts training-and-teaching https://nesterenkojul.github.io/training-and-teaching/
//
// Note: <page-filename-without-.md> is the file's name in
// src/content/pages/, which may not always match the URL slug -- check
// src/content/pages/ if you're not sure.

import fs from 'node:fs'
import path from 'node:path'
import * as yaml from 'js-yaml'
import { parse } from 'node-html-parser'

const [, , pageFile, liveUrl] = process.argv
if (!pageFile || !liveUrl) {
  console.error('Usage: pnpm tsx scripts/link-trainings-to-blocks.ts <page-filename-without-.md> <live-url>')
  process.exit(1)
}

const PAGE_PATH = path.resolve(process.cwd(), 'src/content/pages', `${pageFile}.md`)
const TRAININGS_DIR = path.resolve(process.cwd(), 'src/content/trainings')

function splitFrontmatter(raw: string): { frontmatter: Record<string, any>; body: string } {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)
  if (!match) throw new Error(`${PAGE_PATH} does not have --- frontmatter fences`)
  return { frontmatter: (yaml.load(match[1]) as Record<string, any>) ?? {}, body: match[2] ?? '' }
}

function writeFrontmatter(frontmatter: Record<string, any>, body: string): string {
  const clean = Object.fromEntries(Object.entries(frontmatter).filter(([, v]) => v !== undefined && v !== null))
  return `---\n${yaml.dump(clean, { lineWidth: 100 })}---\n\n${body}`
}

async function main() {
  // 1. Title -> slug lookup, built from the training files already created
  //    by migrate-trainings.ts
  const titleToSlug = new Map<string, string>()
  for (const file of fs.readdirSync(TRAININGS_DIR)) {
    if (!file.endsWith('.md')) continue
    const raw = fs.readFileSync(path.join(TRAININGS_DIR, file), 'utf-8')
    const { frontmatter } = splitFrontmatter(raw)
    if (frontmatter.title) titleToSlug.set(String(frontmatter.title).trim(), file.replace(/\.md$/, ''))
  }
  console.log(`Loaded ${titleToSlug.size} training titles from ${TRAININGS_DIR}`)

  // 2. Fetch the live page, scoped to <main> so nav/footer links don't leak in
  const html = await (await fetch(liveUrl)).text()
  const root = parse(html)
  const main = root.querySelector('main')
  if (!main) throw new Error('Could not find <main> in the fetched page -- is this the right URL?')

  // Walk headings/links in document order: every H2 starts a new group,
  // every <a> found after it (until the next H2) belongs to that group.
  const groupedTitles = new Map<string, string[]>()
  let currentOrg: string | null = null

  for (const el of main.querySelectorAll('h2, a')) {
    if (el.tagName === 'H2') {
      currentOrg = el.text.trim()
      groupedTitles.set(currentOrg, [])
    } else if (el.tagName === 'A' && currentOrg) {
      const title = el.text.trim()
      if (title) groupedTitles.get(currentOrg)!.push(title)
    }
  }
  console.log(`Found ${groupedTitles.size} H2 section(s) on the live page: ${[...groupedTitles.keys()].join(', ')}`)

  // 3. Match each trainingSections block's heading to a live-page section,
  //    then each course title in that section to a trainings/*.md slug
  const raw = fs.readFileSync(PAGE_PATH, 'utf-8')
  const { frontmatter, body } = splitFrontmatter(raw)
  if (!Array.isArray(frontmatter.layout)) throw new Error(`${PAGE_PATH} has no layout array`)

  let updatedBlocks = 0
  const unmatchedTitles: string[] = []

  frontmatter.layout = frontmatter.layout.map((block: any) => {
    if (block.blockType !== 'trainingSections') return block

    const titles = groupedTitles.get(String(block.heading ?? '').trim())
    if (!titles) {
      console.warn(`No matching H2 on the live page for block heading "${block.heading}" -- left untouched`)
      return block
    }

    const slugs: string[] = []
    for (const title of titles) {
      const slug = titleToSlug.get(title)
      if (slug) slugs.push(slug)
      else unmatchedTitles.push(`${block.heading} → ${title}`)
    }

    updatedBlocks++
    // reference() fields are written as plain slug strings in frontmatter --
    // Astro resolves them into { id, collection } objects itself at parse
    // time, so we should NOT write objects here.
    return { ...block, trainings: slugs }
  })

  fs.writeFileSync(PAGE_PATH, writeFrontmatter(frontmatter, body))

  console.log(`\nUpdated ${updatedBlocks} trainingSections block(s) in ${pageFile}.md`)
  if (unmatchedTitles.length > 0) {
    console.warn(`\nCould not match ${unmatchedTitles.length} course title(s) to a trainings file -- check these manually:`)
    unmatchedTitles.forEach((t) => console.warn(`  - ${t}`))
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})