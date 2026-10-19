import { divisionFor, rankFor, romanFor } from '../../lib/codeforces/ranks'
import { RankEmblem } from '../rank-emblem'

const nameOf = (average: number) => [rankFor(average).name, romanFor(divisionFor(average))].filter(Boolean).join(' ')

/** A big emblem of the rank and division an average rating falls in, next to a ranking's title. */
export function AverageRankEmblem({ average }: { average: number | null }) {
  if (average === null) return null
  return (
    <RankEmblem
      rank={rankFor(average)}
      division={divisionFor(average)}
      size={128}
      label={`Average rank: ${nameOf(average)}`}
      className="h-24 w-24 shrink-0 sm:h-32 sm:w-32"
    />
  )
}

/** "Average rank · Newbie III", in the rank's colour, under the title. */
export function AverageRankLabel({ average }: { average: number | null }) {
  if (average === null) return null
  return (
    <p className="font-label text-sm font-bold tracking-[0.14em] uppercase" style={{ color: rankFor(average).color }}>
      Average rank · {nameOf(average)}
    </p>
  )
}
