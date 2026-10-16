import type { Rank } from '../../lib/codeforces/ranks'

/** A handle in its rank's colour; legendary grandmasters wear their first letter in the text colour, as on Codeforces. */
export function HandleName({ handle, rank }: { handle: string; rank: Rank }) {
  if (rank.tier === 9) {
    return (
      <span style={{ color: rank.color }}>
        <span className="text-ink">{handle[0]}</span>
        {handle.slice(1)}
      </span>
    )
  }
  return <span style={{ color: rank.color }}>{handle}</span>
}
