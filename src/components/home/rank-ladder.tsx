import { RANKS } from '../../lib/codeforces/ranks'
import { RankEmblem } from '../rank-emblem'
import { Panel } from '../ui/panel'

/** Every rank with its emblem and the rating it starts at. */
export function RankLadder() {
  return (
    <Panel title="Rank ladder" aside="One star per colour">
      <ol className="grid grid-cols-2 gap-2 min-[420px]:grid-cols-3 sm:grid-cols-5">
        {RANKS.map((rank, i) => (
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
          </li>
        ))}
      </ol>
    </Panel>
  )
}
