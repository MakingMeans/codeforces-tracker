const MINUS = '−'

/** A rating change as Codeforces prints it, with a true minus sign: +62, −33, 0. */
export const formatDelta = (delta: number) => (delta > 0 ? `+${delta}` : delta < 0 ? `${MINUS}${-delta}` : '0')

export const formatNumber = (value: number) => value.toLocaleString('en-US')

/** "Oct 12, 2026" */
export const formatDate = (time: number) =>
  new Date(time).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

/** "2h 15m", "2h", "45m"; empty for 0 (contests whose length is unknown). */
export function formatDuration(seconds: number) {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.round((seconds % 3600) / 60)
  return [hours ? `${hours}h` : '', minutes ? `${minutes}m` : ''].filter(Boolean).join(' ')
}

/** "1 contest", "3 contests" */
export const plural = (count: number, word: string, many = `${word}s`) =>
  `${formatNumber(count)} ${count === 1 ? word : many}`

/** "Mar 2023" */
export const formatMonthYear = (time: number) =>
  new Date(time).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })

/** "Oct 18, 2026, 3:58 AM" in the visitor's time zone. */
export const formatDateTime = (time: number) =>
  new Date(time).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })

/** "Tue, Oct 20, 10:35 AM" in the visitor's time zone. */
export const formatStart = (time: number) =>
  new Date(time).toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })

const MINUTE = 60_000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

/** Time left before a start: "in 4d 6h", "in 3h 12m", "in 12m", "starting now". */
export function formatCountdown(ms: number) {
  if (ms < MINUTE) return 'starting now'
  const days = Math.floor(ms / DAY)
  const hours = Math.floor((ms % DAY) / HOUR)
  const minutes = Math.floor((ms % HOUR) / MINUTE)
  if (days) return `in ${days}d ${hours}h`
  if (hours) return `in ${hours}h ${minutes}m`
  return `in ${minutes}m`
}

/** How long ago: "just now", "5 minutes ago", "2 hours ago", "3 days ago", then the month and year. */
export function formatAgo(ms: number, then: number) {
  if (ms < MINUTE) return 'just now'
  if (ms < HOUR) return `${plural(Math.floor(ms / MINUTE), 'minute')} ago`
  if (ms < DAY) return `${plural(Math.floor(ms / HOUR), 'hour')} ago`
  if (ms < 30 * DAY) return `${plural(Math.floor(ms / DAY), 'day')} ago`
  return formatMonthYear(then)
}
