// src/pages/social-queue.json.ts
//
// A machine-readable list of every post and event that editors have ticked
// "Share on social media" on in the CMS. scripts/share-to-buffer.mjs reads it
// from the live site after each deploy and sends new items to Buffer. Using
// the built site (instead of re-parsing the Markdown files) guarantees the
// links in the social posts are exactly the page addresses that really exist.

import type { APIRoute } from 'astro'
import { getCollection } from 'astro:content'
import { resolveRefs } from '../lib/references'
import { eventExcerpt, formatEventDate } from '../lib/events'

const day = (d?: Date) => (d ? d.toISOString().slice(0, 10) : null)

export const GET: APIRoute = async ({ site }) => {
  const origin = (site ?? new URL('https://www.dariah.fi')).origin
  const abs = (path?: string) => (path ? new URL(path, origin).toString() : null)

  const items: Record<string, unknown>[] = []

  for (const post of await getCollection('posts')) {
    if (!post.data.shareOnSocial) continue
    const tags = await resolveRefs('tags', post.data.tags)
    items.push({
      type: 'post',
      id: post.id,
      url: abs(`/posts/${post.id}/`),
      title: post.data.title,
      summary: post.data.meta?.description || eventExcerpt(post.body, 220),
      image: abs(post.data.meta?.image ?? post.data.heroImage),
      tags: tags.map((t) => t.data.title),
      publishedAt: day(post.data.publishedAt),
      postDate: day(post.data.socialPostDate),
    })
  }

  for (const event of await getCollection('events')) {
    if (!event.data.shareOnSocial || event.data.cancelled) continue
    const tags = await resolveRefs('tags', event.data.tags)
    items.push({
      type: 'event',
      id: event.id,
      url: abs(`/events/${event.id}/`),
      title: event.data.title,
      summary: eventExcerpt(event.body, 220),
      image: abs(event.data.featuredImage),
      tags: tags.map((t) => t.data.title),
      dateLine: formatEventDate(event.data.startDate, {
        startTime: event.data.startTime,
        endDate: event.data.endDate,
        endTime: event.data.endTime,
      }),
      location: event.data.location ?? null,
      isOnline: event.data.isOnline,
      startDate: day(event.data.startDate),
      endDate: day(event.data.endDate ?? event.data.startDate),
      postDate: day(event.data.socialPostDate),
    })
  }

  return new Response(
    JSON.stringify({ commit: process.env.GITHUB_SHA ?? null, generatedAt: new Date().toISOString(), items }, null, 2),
    { headers: { 'Content-Type': 'application/json' } },
  )
}