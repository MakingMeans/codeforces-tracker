import { cn } from '../../lib/cn'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost'

const BASE =
  'cut inline-flex cursor-pointer items-center justify-center gap-2 px-5 py-2.5 font-label text-[15px] leading-tight font-bold tracking-[0.14em] uppercase [--cut:10px] disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:h-4 [&_svg]:w-4 [&_svg]:shrink-0'

/** Red buttons carry navy text: white on the accent red is only 3.4:1. */
const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'text-on-accent [--cut-fill:var(--color-accent)] [--cut-line:var(--color-accent)] hover:[--cut-fill:var(--color-ink)] hover:[--cut-line:var(--color-ink)]',
  secondary:
    'text-ink [--cut-fill:var(--color-bg)] [--cut-line:var(--color-line-strong)] hover:[--cut-fill:var(--color-surface-2)]',
  ghost:
    'text-ink-muted [--cut-fill:transparent] [--cut-line:transparent] hover:text-ink hover:[--cut-fill:var(--color-surface-2)]',
}

/** Classes for anything that should look like a button. */
export const buttonClass = (variant: ButtonVariant = 'secondary', className?: string) =>
  cn(BASE, VARIANTS[variant], className)
