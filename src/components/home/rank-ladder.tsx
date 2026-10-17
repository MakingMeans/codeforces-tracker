import { DIVISIONS, RANKS, romanFor } from '../../lib/codeforces/ranks'
import { RankEmblem } from '../rank-emblem'
import { Panel } from '../ui/panel'

/** "I 1200–1249 · II 1250–1299 …", the ranges behind a rank's divisions; the top one is open. */
function ranges(tier: number) {
  const { from, step, count } = DIVISIONS[tier]
  return Array.from({ length: count }, (_, i) => {
    const lo = from + i * step
    const last = i === count - 1
    if (tier === RANKS.length - 1 && last) return `${romanFor(i + 1)} ${lo}+`
    return `${romanFor(i + 1)} ${tier === 0 && i === 0 ? 'up to ' : `${lo}–`}${lo + step - 1}`
  }).join(' · ')
}

/** Every rank with its emblem, the rating it starts at, and its divisions. */
export function RankLadder() {
  return (
    <Panel title="Rank ladder" aside="One star per colour">
      <ol className="grid grid-cols-2 gap-2 min-[420px]:grid-cols-3 sm:grid-cols-5">
        {RANKS.map((rank, i) => {
          const { step, count } = DIVISIONS[rank.tier]
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
              <span
                title={ranges(rank.tier)}
                className="font-label text-xs font-semibold tracking-[0.04em] tabular-nums"
              >
                <span aria-hidden>
                  I–{romanFor(count)} · {step} each
                </span>
                <span className="sr-only">Divisions: {ranges(rank.tier)}</span>
              </span>
            </li>
          )
        })}
      </ol>
      <p className="text-sm text-ink-muted">
        Each rank is split into divisions of equal size, shown as a numeral on the emblem, I the lowest. Pupil, for
        instance, runs {ranges(1)}. The last division of Legendary Grandmaster has no ceiling.
      </p>
    </Panel>
  )
}
