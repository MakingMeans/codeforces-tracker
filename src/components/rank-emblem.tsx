import { useId, useMemo } from 'react'
import type { Rank } from '../lib/codeforces/ranks'
import { emblemInner, emblemLabel } from '../lib/emblem'

interface RankEmblemProps {
  rank: Rank
  /** Rendered width and height in px. */
  size?: number
  className?: string
  /** The division within the rank, from `divisionFor`; drawn as a roman numeral when above 0. */
  division?: number
  /** Accessible name; defaults to the rank, its division and its stars. */
  label?: string
}

/**
 * The rank's emblem (see docs/DESIGN.md, "Rank emblems"). The markup comes from
 * lib/emblem, which only ever draws from fixed geometry, never from user input.
 */
export function RankEmblem({ rank, size = 64, className, division = 0, label }: RankEmblemProps) {
  const id = `cfe${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`
  const inner = useMemo(() => emblemInner(rank.tier, { id, division }), [rank.tier, id, division])

  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      role="img"
      aria-label={label ?? emblemLabel(rank.tier, division)}
      className={className}
      style={{ color: rank.color }}
      dangerouslySetInnerHTML={{ __html: inner }}
    />
  )
}
