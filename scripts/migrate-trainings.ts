// scripts/migrate-trainings.ts
//
// Run this FROM your Astro project (not the Payload one) -- it only touches
// files already in this repo. It finds any `trainingSections` block still
// using the old inline groups/courses shape, extracts each course into its
// own file under src/content/trainings/, and rewrites the page's block down
// to just { heading, intro }.
//
// Usage:
//   pnpm add -D js-yaml @types/js-yaml   # if not already a dependency
//   pnpm tsx scripts/migrate-trainings.ts
//
// Safe to run more than once -- pages with no old-style groups are left
// untouched, and re-running after a successful migration is a no-op.

import fs from 'node:fs'
import path from 'node:path'
import * as yaml from 'js-yaml'

const PAGES_DIR = path.resolve(process.cwd(), 'src/content/pages')
const TRAININGS_DIR = path.resolve(process.cwd(), 'src/content/trainings')

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function splitFrontmatter(raw: string): { frontmatter: Record<string, any>; body: string } {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)
  if (!match) throw new Error('File does not have --- frontmatter fences')
  return { frontmatter: (yaml.load(match[1]) as Record<string, any>) ?? {}, body: match[2] ?? '' }
}

function writeFrontmatter(frontmatter: Record<string, any>, body: string): string {
  const clean = Object.fromEntries(
    Object.entries(frontmatter).filter(([, v]) => v !== undefined && v !== null),
  )
  return `---\n${yaml.dump(clean, { lineWidth: 100 })}---\n\n${body}`
}

function main() {
  fs.mkdirSync(TRAININGS_DIR, { recursive: true })

  const pageFiles = fs.readdirSync(PAGES_DIR).filter((f) => f.endsWith('.md'))
  let extractedCount = 0
  let touchedPages = 0

  for (const file of pageFiles) {
    const filePath = path.join(PAGES_DIR, file)
    const raw = fs.readFileSync(filePath, 'utf-8')
    const { frontmatter, body } = splitFrontmatter(raw)

    if (!Array.isArray(frontmatter.layout)) continue

    let changed = false
    let order = 0

    const newLayout = frontmatter.layout.map((block: any) => {
      if (block.blockType !== 'trainingSections' || !Array.isArray(block.groups)) {
        return block // already migrated, or a different block type entirely
      }

      changed = true
      for (const group of block.groups) {
        for (const course of group.courses ?? []) {
          const slug = slugify(course.title) || `training-${order}`
          const trainingPath = path.join(TRAININGS_DIR, `${slug}.md`)
          const trainingContent = writeFrontmatter(
            {
              title: course.title,
              url: course.url,
              group: group.levelLabel,
              levelTags: course.levelTags,
              order,
            },
            course.description ?? '',
          )
          fs.writeFileSync(trainingPath, trainingContent)
          extractedCount++
          order++
        }
      }

      // Strip the block down to just what the new schema expects
      return { blockType: 'trainingSections', heading: block.heading, intro: block.intro }
    })

    if (changed) {
      frontmatter.layout = newLayout
      fs.writeFileSync(filePath, writeFrontmatter(frontmatter, body))
      touchedPages++
    }
  }

  console.log(`Extracted ${extractedCount} trainings into ${TRAININGS_DIR}`)
  console.log(`Updated ${touchedPages} page file(s)`)
}

main()