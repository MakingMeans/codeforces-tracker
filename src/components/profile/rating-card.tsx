import type { ProfileUser } from '../../lib/codeforces/user'
import { RankEmblem } from '../rank-emblem'
import { Panel } from '../ui/panel'

function Row({ label, rating, rank }: { label: string; rating: number; rank: ProfileUser['rank'] }) {
  return (
    <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-4 border-t border-line pt-3 first:border-t-0 first:pt-0">
      <RankEmblem rank={rank} size={72} />
      <div className="grid">
        <span className="font-label text-[13px] font-semibold tracking-[0.16em] text-ink-muted uppercase">{label}</span>
        <span className="font-display text-[34px] leading-none">{rating}</span>
        <span
          className="font-label text-[13px] leading-tight font-bold tracking-[0.1em] uppercase"
          style={{ color: rank.color }}
        >
          {rank.name}
        </span>
      </div>
    </div>
  )
}

/** Current and peak rating with their emblems. */
export function RatingCard({ user }: { user: ProfileUser }) {
  return (
    <Panel title="Rating">
      {user.rating === null || user.maxRating === null ? (
        <p className="text-sm text-ink-muted">
          {user.handle} has not taken a rated contest yet. Their rank and rating chart appear after the first one.
        </p>
      ) : (
        <div className="grid gap-3">
          <Row label="Current" rating={user.rating} rank={user.rank} />
          <Row label="Peak" rating={user.maxRating} rank={user.maxRank} />
        </div>
      )}
    </Panel>
  )
}
