import { cn } from '../../lib/cn'

/**
 * Text fields. Not cut like buttons and panels: the cut is drawn on ::before and
 * ::after, which inputs cannot have, so fields get a plain 1 px border instead.
 */
export const fieldClass = (className?: string) =>
  cn(
    'min-w-0 border border-line-strong bg-surface-2 px-3 py-2.5 text-[15px] text-ink placeholder:text-ink-muted hover:border-ink/50 focus-visible:border-ink',
    className,
  )
