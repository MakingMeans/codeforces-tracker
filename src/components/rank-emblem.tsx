import { useId, useMemo } from 'react'
import type { Rank } from '../lib/codeforces/ranks'
import { emblemInner, emblemLabel } from '../lib/emblem'

interface RankEmblemProps {
  rank: Rank
  /** Rendered width and height in px. */
  size?: number
  className?: string
  /** Accessible name; defaults to the rank and its stars. */
  label?: string
}

/**
 * The rank's emblem (see docs/DESIGN.md, "Rank emblems"). The markup comes from
 * lib/emblem, which only ever draws from fixed geometry, never from user input.
 */
export function RankEmblem({ rank, size = 64, className, label }: RankEmblemProps) {
  const id = `cfe${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`
  const inner = useMemo(() => emblemInner(rank.tier, { id }), [rank.tier, id])

  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      role="img"
      aria-label={label ?? emblemLabel(rank.tier)}
      className={className}
      style={{ color: rank.color }}
      dangerouslySetInnerHTML={{ __html: inner }}
    />
  )
}
