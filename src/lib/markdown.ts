// src/lib/markdown.ts
//
// Our hero/block rich text fields are stored as plain markdown strings in
// frontmatter (not the file's main body), so Astro doesn't render them
// automatically like it does for a file's body content. This one function
// converts a markdown string into an HTML string wherever we need to show
// one of those fields.

import { marked } from 'marked'

export function md(input?: string): string {
  return input ? (marked.parse(input) as string) : ''
}
