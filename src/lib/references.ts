// src/lib/references.ts
//
// PagesCMS's reference field only works correctly (dropdown fetching AND
// search) when its `value` template is "{path}" -- meaning it stores the
// full relative file path (e.g. "src/content/local-offices/jyvaskyla.md"),
// not a bare slug. Rather than keep fighting that, every reference-like
// field in content.config.ts is a plain string (or array of strings)
// instead of astro:content's reference() type, and the functions here do
// the actual lookup by hand -- stripping the path down to the bare slug
// getEntry() needs.

import { getEntry } from 'astro:content'

// "src/content/local-offices/jyvaskyla.md" -> "jyvaskyla"
// Falls back to returning the input unchanged if it's already a bare slug
// (e.g. content written by a script, or before this change).
export function slugFromRef(raw?: string): string | undefined {
  if (!raw) return undefined
  const match = raw.match(/^src\/content\/[a-z0-9-]+\/(.+)\.md$/)
  return match ? match[1] : raw
}

export async function resolveRef(collection: string, raw?: string) {
  const slug = slugFromRef(raw)
  if (!slug) return undefined
  return getEntry(collection as any, slug)
}

export async function resolveRefs(collection: string, raw?: string[]) {
  if (!raw || raw.length === 0) return []
  const entries = await Promise.all(raw.map((r) => resolveRef(collection, r)))
  return entries.filter((e) => e !== undefined)
}

// For comparing a stored reference value against a known entry id (e.g.
// "is this training's localOffice the office whose page we're on").
export function refEquals(raw: string | undefined, id: string): boolean {
  return slugFromRef(raw) === id
}

export function refsInclude(raw: string[] | undefined, id: string): boolean {
  return (raw ?? []).some((r) => slugFromRef(r) === id)
}
