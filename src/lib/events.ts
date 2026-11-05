// src/lib/events.ts
//
// Upcoming/past is computed here from the actual date, rather than stored
// as a manually-set field -- this is what makes event status "automatic":
// every time the site rebuilds, this comparison re-runs against whatever
// "now" actually is at build time. See .github/workflows/deploy.yml for
// the daily scheduled rebuild that keeps this current even with no content
// changes.

export function isPastEvent(event: { startDate: Date; endDate?: Date }): boolean {
  const reference = event.endDate ?? event.startDate
  return reference.valueOf() < Date.now()
}

export function formatEventDate(
  startDate: Date,
  options: { startTime?: string; endDate?: Date; endTime?: string; includeWeekday?: boolean } = {},
): string {
  const { startTime, endDate, endTime, includeWeekday } = options

  const dateFmt = new Intl.DateTimeFormat('en-GB', {
    ...(includeWeekday ? { weekday: 'long' as const } : {}),
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  let result = dateFmt.format(startDate)
  const sameDay = endDate ? startDate.toDateString() === endDate.toDateString() : true

  if (endDate && !sameDay) {
    result += ` – ${dateFmt.format(endDate)}`
  } else if (startTime) {
    result += `, ${startTime}`
    if (endTime) result += `–${endTime}`
  }

  return result
}

// Short plain-text preview of an event's Markdown body, cut at a word
// boundary. Used in the event list cards.
export function eventExcerpt(body: string | undefined, maxLength = 300): string {
  if (!body) return ''
  const text = body
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '') // images
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // links -> link text
    .replace(/<[^>]+>/g, ' ') // inline HTML
    .replace(/^\s{0,3}(#{1,6}|>|[-*+]|\d+[.)])\s+/gm, '') // headings, quotes, list markers
    .replace(/[*_`~]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).replace(/\s+\S*$/, '') + ' […]'
}

// Groups an already-sorted list of events into month sections, keeping the
// incoming order (dates are stored as UTC midnight, so group in UTC).
export function groupByMonth<T extends { data: { startDate: Date } }>(events: T[]): { label: string; events: T[] }[] {
  const fmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'UTC', month: 'long', year: 'numeric' })
  const groups: { label: string; events: T[] }[] = []
  for (const event of events) {
    const label = fmt.format(event.data.startDate)
    const last = groups[groups.length - 1]
    if (last && last.label === label) last.events.push(event)
    else groups.push({ label, events: [event] })
  }
  return groups
}