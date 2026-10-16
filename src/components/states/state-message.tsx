import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

interface StateMessageProps {
  icon: LucideIcon
  title: string
  children?: ReactNode
  /** Buttons or links under the message. */
  actions?: ReactNode
  /** Red for errors, muted otherwise. */
  tone?: 'error' | 'neutral'
}

/** A full-width message in place of a page: not found, invalid handle, offline… */
export function StateMessage({ icon: Icon, title, children, actions, tone = 'neutral' }: StateMessageProps) {
  return (
    <div className="mx-auto grid max-w-[680px] justify-items-center gap-5 px-4 py-20 text-center sm:py-28">
      <span
        className={cn(
          'cut grid h-16 w-16 place-items-center [--cut:10px] [--cut-fill:var(--color-surface)]',
          tone === 'error' ? 'text-accent [--cut-line:var(--color-accent)]' : 'text-ink-muted',
        )}
      >
        <Icon aria-hidden className="h-7 w-7" />
      </span>
      <h1 className="font-display text-[clamp(32px,6vw,52px)] leading-none text-balance uppercase">{title}</h1>
      {children ? <div className="grid max-w-[56ch] gap-2 text-ink-muted">{children}</div> : null}
      {actions ? <div className="flex flex-wrap justify-center gap-3">{actions}</div> : null}
    </div>
  )
}
