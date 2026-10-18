import { formatAgo, formatDateTime } from '../../lib/codeforces/format'
import { useNow } from '../../lib/use-now'

/** "updated 2 hours ago", the exact time in its tooltip; it counts on while the page stays open. */
export function UpdatedAgo({ time }: { time: number }) {
  const now = useNow(60_000)
  return (
    <time dateTime={new Date(time).toISOString()} title={formatDateTime(time)}>
      updated {formatAgo(Math.max(0, now - time), time)}
    </time>
  )
}
