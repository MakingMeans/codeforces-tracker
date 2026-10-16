import type { Activity } from '../../lib/codeforces/activity'
import { formatNumber } from '../../lib/codeforces/format'

function Trio({ title, values }: { title: string; values: Activity['solved'] }) {
  return (
    <div className="cut grid min-w-0 gap-2 px-4 py-3 [--cut:10px] [--cut-fill:var(--color-surface-2)]">
      <h3 className="font-label text-[13px] font-semibold tracking-[0.16em] text-ink-muted uppercase">{title}</h3>
      <dl className="grid grid-cols-3 gap-2">
        {(
          [
            ['All time', values.all],
            ['Last year', values.year],
            ['Last 30 days', values.month],
          ] as const
        ).map(([label, value]) => (
          <div key={label} className="flex flex-col-reverse">
            <dt className="text-[13px] text-ink-muted">{label}</dt>
            <dd className="font-display text-[30px] leading-tight">{formatNumber(value)}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

/** Problems solved and longest streaks, all time, last year and last 30 days. */
export function ActivityCards({ activity }: { activity: Activity }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Trio title="Problems solved" values={activity.solved} />
      <Trio title="Longest streak · days" values={activity.streak} />
    </div>
  )
}
