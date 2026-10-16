import { formatNumber } from '../../lib/codeforces/format'
import type { LanguageShare } from '../../lib/codeforces/insights'
import { Panel } from '../ui/panel'

/** Fixed slot order, validated for colour-blind readers when adjacent; literal names so Tailwind generates them. */
const SLOTS = ['bg-lang-1', 'bg-lang-2', 'bg-lang-3', 'bg-lang-4', 'bg-lang-5', 'bg-lang-6']
const slotFor = (share: LanguageShare, index: number) => (share.language === 'Other' ? 'bg-lang-other' : SLOTS[index])
const percent = (value: number) => `${value >= 10 || value === 0 ? Math.round(value) : value.toFixed(1)}%`

/** Share of submissions per language, as a bar and a labelled list. */
export function LanguagesCard({ languages }: { languages: LanguageShare[] }) {
  const total = languages.reduce((sum, share) => sum + share.count, 0)

  return (
    <Panel title="Languages" aside={`${formatNumber(total)} submissions`}>
      {total === 0 ? (
        <p className="text-sm text-ink-muted">No submissions yet.</p>
      ) : (
        <>
          <div aria-hidden className="flex h-3 gap-[2px]">
            {languages.map((share, i) => (
              <span
                key={share.language}
                className={`block h-full min-w-[3px] ${slotFor(share, i)}`}
                style={{ flexGrow: share.count, flexBasis: 0 }}
              />
            ))}
          </div>
          <ul className="grid gap-1.5">
            {languages.map((share, i) => (
              <li
                key={share.language}
                className="grid grid-cols-[10px_minmax(0,1fr)_auto] items-center gap-2.5 text-sm"
                title={`${formatNumber(share.count)} submissions`}
              >
                <span aria-hidden className={`h-2.5 w-2.5 ${slotFor(share, i)}`} />
                <span className="truncate">{share.language}</span>
                <span className="font-semibold tabular-nums">{percent(share.percent)}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </Panel>
  )
}
