import { useState } from 'react'
import { cn } from '../../lib/cn'
import { PlaceField, type PlaceKind } from './place-field'
import { SearchBox } from './search-box'

export type SearchScope = 'player' | PlaceKind

const LABEL: Record<SearchScope, string> = {
  player: 'Player',
  country: 'Country',
  city: 'City',
  org: 'Organization',
}

/** One search, several things to find: a player by handle, or a country's, city's or organization's ranking. */
export function ScopedSearch({ scopes }: { scopes: SearchScope[] }) {
  const [scope, setScope] = useState(scopes[0])

  return (
    <div className="grid gap-3">
      <div role="group" aria-label="Search for" className="flex flex-wrap gap-1">
        {scopes.map((item) => (
          <button
            key={item}
            type="button"
            aria-pressed={item === scope}
            onClick={() => setScope(item)}
            className={cn(
              'cursor-pointer px-3 py-1.5 font-label text-[13px] font-bold tracking-[0.12em] text-ink-muted uppercase transition-colors hover:text-ink',
              item === scope ? 'bg-surface-2 text-ink shadow-[inset_0_-2px_0_var(--color-accent)]' : 'bg-surface',
            )}
          >
            {LABEL[item]}
          </button>
        ))}
      </div>
      {scope === 'player' ? <SearchBox variant="hero" /> : <PlaceField key={scope} kind={scope} />}
    </div>
  )
}
