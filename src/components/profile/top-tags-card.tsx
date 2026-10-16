import { formatNumber } from '../../lib/codeforces/format'
import type { TagCount } from '../../lib/codeforces/insights'
import { Panel } from '../ui/panel'

/** The most common tags among solved problems, with bars against the top one. */
export function TopTagsCard({ tags }: { tags: TagCount[] }) {
  const top = tags[0]?.count ?? 0

  return (
    <Panel title="Top tags" aside="Solved problems">
      {tags.length === 0 ? (
        <p className="text-sm text-ink-muted">No tagged problem solved yet.</p>
      ) : (
        <ol className="grid gap-2.5">
          {tags.map(({ tag, count }) => (
            <li key={tag} className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-1 text-sm">
              <span className="truncate">{tag}</span>
              <span className="font-semibold tabular-nums">{formatNumber(count)}</span>
              <span aria-hidden className="col-span-2 h-1 bg-surface-2">
                <span className="block h-full bg-ink-muted" style={{ width: `${(count / top) * 100}%` }} />
              </span>
            </li>
          ))}
        </ol>
      )}
    </Panel>
  )
}
