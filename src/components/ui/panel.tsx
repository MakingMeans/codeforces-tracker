import { useId, type ReactNode } from 'react'
import { cn } from '../../lib/cn'

interface PanelProps {
  title: string
  /** Short context on the right of the title, such as a count. */
  aside?: ReactNode
  className?: string
  children: ReactNode
}

/** A titled card with cut corners; the building block of every page section. */
export function Panel({ title, aside, className, children }: PanelProps) {
  const headingId = useId()
  return (
    <section
      aria-labelledby={headingId}
      className={cn('cut grid min-w-0 content-start gap-4 p-5 [--cut:14px] sm:p-6', className)}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2
          id={headingId}
          className="flex items-center gap-2.5 font-label text-[15px] font-bold tracking-[0.18em] uppercase"
        >
          <span aria-hidden className="h-3.5 w-[3px] bg-accent" />
          {title}
        </h2>
        {aside ? <p className="text-sm text-ink-muted tabular-nums">{aside}</p> : null}
      </div>
      {children}
    </section>
  )
}
