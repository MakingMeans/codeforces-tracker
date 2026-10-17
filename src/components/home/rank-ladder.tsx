import { DIVISIONS, RANKS, romanFor } from '../../lib/codeforces/ranks'
import { RankEmblem } from '../rank-emblem'
import { Panel } from '../ui/panel'

/** "I 1200–1269 · II 1270–1329 · III 1330–1399", the ranges behind a rank's divisions; the top one is open. */
function ranges(tier: number) {
  const { starts } = DIVISIONS[tier]
  const next = RANKS[tier + 1]
  return starts
    .map((start, i) => {
      const end = i < starts.length - 1 ? starts[i + 1] - 1 : next ? (next.min ?? 0) - 1 : null
      if (tier === 0 && i === 0) return `${romanFor(1)} up to ${end}`
      return `${romanFor(i + 1)} ${start}${end === null ? '+' : `–${end}`}`
    })
    .join(' · ')
}

/** Every rank with its emblem, the rating it starts at, and where its divisions II and III start. */
export function RankLadder() {
  return (
    <Panel title="Rank ladder" aside="One star per colour">
      <ol className="grid grid-cols-2 gap-2 min-[420px]:grid-cols-3 sm:grid-cols-5">
        {RANKS.map((rank, i) => {
          const { starts } = DIVISIONS[rank.tier]
          return (
            <li
              key={rank.name}
              className="cut grid animate-fade-up content-start justify-items-center gap-1 px-1 pt-3 pb-2.5 text-center [--cut:9px] [--cut-fill:var(--color-bg)]"
              // The ranks come in one after another, from Newbie up, once the panel is in.
              style={{ animationDelay: `${560 + i * 45}ms` }}
            >
              <RankEmblem rank={rank} size={100} className="h-auto w-full max-w-[100px]" />
              <span
                className="font-label text-xs leading-tight font-bold tracking-[0.06em] uppercase"
                style={{ color: rank.color }}
              >
                {rank.name}
              </span>
              <span className="text-xs text-ink-muted tabular-nums">
                {rank.tier === 0 ? 'Below 1200' : `${rank.min}+`}
              </span>
              <span title={ranges(rank.tier)} className="font-label text-xs font-semibold tabular-nums">
                <span aria-hidden>
                  II {starts[1]} · III {starts[2]}
                </span>
                <span className="sr-only">Divisions: {ranges(rank.tier)}</span>
              </span>
            </li>
          )
        })}
      </ol>
      <p className="text-sm text-ink-muted">
        Every rank has three divisions, shown as a numeral on the emblem: I where the rank starts, then II and III from
        the ratings under each rank. Pupil, for instance, runs {ranges(1)}. Legendary Grandmaster’s III has no ceiling.
      </p>
    </Panel>
  )
}
