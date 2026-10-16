import { cn } from '../../lib/cn'

/** A thin bar of moving diagonal stripes, with a text label for screen readers and sighted users alike. */
export function ScanLoader({ label, className }: { label: string; className?: string }) {
  return (
    <div role="status" className={cn('grid gap-2', className)}>
      <span
        aria-hidden
        className="block h-1.5 w-full animate-scan bg-[repeating-linear-gradient(-45deg,var(--color-accent)_0_7px,transparent_7px_14px)] bg-[length:28px_100%] opacity-80"
      />
      <span className="font-label text-[13px] font-semibold tracking-[0.16em] text-ink-muted uppercase">{label}</span>
    </div>
  )
}
