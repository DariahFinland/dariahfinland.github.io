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