import { cn } from '../../lib/cn'

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5 font-display leading-none tracking-[0.02em]', className)}>
      <span aria-hidden className="h-[1em] w-1 bg-accent" />
      <span>
        CF<span className="mx-px inline-block -skew-x-8 text-accent">/</span>TRACKER
      </span>
    </span>
  )
}
