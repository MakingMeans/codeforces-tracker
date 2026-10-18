import type { ReactNode } from 'react'

export interface StatTile {
  label: string
  value: ReactNode
  /** A rank colour for ratings. */
  color?: string
}

/** The figures at the top of a ranking: big number, small label; two even columns on phones. */
export function StatTiles({ items }: { items: StatTile[] }) {
  return (
    <dl className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap">
      {items.map(({ label, value, color }) => (
        <div
          key={label}
          className="cut grid content-start gap-2 px-4 py-3.5 [--cut:8px] [--cut-fill:var(--color-surface)] [--cut-line:var(--color-line)] sm:min-w-[8.5rem] sm:px-5"
        >
          <dt className="order-2 font-label text-[12px] font-semibold tracking-[0.14em] text-ink-muted uppercase">
            {label}
          </dt>
          <dd className="order-1 font-display text-[36px] leading-none tabular-nums" style={{ color }}>
            {value}
          </dd>
        </div>
      ))}
    </dl>
  )
}
