import { Search } from 'lucide-react'
import { useId, useMemo, useState, type KeyboardEvent } from 'react'
import { cn } from '../../lib/cn'
import { plural } from '../../lib/codeforces/format'
import { useRankings } from '../../lib/rankings/load'
import { scopeRoute } from '../../lib/rankings/rankings'
import { navigate, type Route } from '../../lib/route'

export type PlaceKind = 'country' | 'city' | 'org'

interface Option {
  id: string
  label: string
  detail?: string
  meta: string
  route: Partial<Route>
}

const PLACEHOLDER: Record<PlaceKind, string> = {
  country: 'Country, e.g. Colombia',
  city: 'City, e.g. Bogotá',
  org: 'Organization, e.g. ITMO University',
}
const NOUN: Record<PlaceKind, string> = { country: 'country', city: 'city', org: 'organization' }

/**
 * A search box that suggests places from the daily rankings as they are typed.
 * Arrow keys move through the suggestions, Enter opens one.
 */
export function PlaceField({ kind }: { kind: PlaceKind }) {
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const [open, setOpen] = useState(false)
  const { state } = useRankings()
  const id = useId()

  const options = useMemo<Option[]>(() => {
    if (state.status !== 'ready') return []
    return state.rankings.suggest(kind, query).map((suggestion, i) => ({
      id: String(i),
      label: suggestion.label,
      detail: suggestion.detail,
      meta: plural(suggestion.players, 'player'),
      route: scopeRoute(suggestion.scope),
    }))
  }, [kind, query, state])

  const showList = open && options.length > 0
  const current = Math.min(active, options.length - 1)
  const status =
    state.status === 'loading'
      ? 'Loading places…'
      : state.status === 'missing'
        ? 'The rankings are not available in this version of the site.'
        : state.status === 'error'
          ? 'Could not load the rankings. Reload the page to try again.'
          : query.trim() && options.length === 0
            ? `No ${NOUN[kind]} with rated players matches “${query.trim()}”.`
            : ''

  function go(option: Option | undefined) {
    if (!option) return
    setOpen(false)
    navigate(option.route)
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      setOpen(true)
      if (options.length) setActive((current + (event.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length)
    } else if (event.key === 'Enter') {
      event.preventDefault()
      go(options[Math.max(0, current)])
    } else if (event.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div className="grid max-w-[640px] gap-2">
      <div className="relative">
        <div className="cut flex items-center [--cut-fill:var(--color-surface)] [--cut-line:var(--color-line-strong)] [--cut:14px] has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-3 has-[input:focus-visible]:outline-ink has-[input:focus-visible]:[--cut-line:var(--color-ink)]">
          <label htmlFor={`${id}-input`} className="sr-only">
            {`Find a ${NOUN[kind]}`}
          </label>
          <Search aria-hidden className="ml-4 h-5 w-5 shrink-0 text-ink-muted" />
          <input
            id={`${id}-input`}
            role="combobox"
            aria-expanded={showList}
            aria-controls={`${id}-list`}
            aria-autocomplete="list"
            aria-activedescendant={showList ? `${id}-option-${current}` : undefined}
            aria-describedby={`${id}-status`}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              setActive(0)
              setOpen(true)
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => setOpen(false)}
            onKeyDown={onKeyDown}
            placeholder={PLACEHOLDER[kind]}
            autoComplete="off"
            spellCheck={false}
            className="w-0 min-w-0 flex-1 bg-transparent px-3 py-4 text-lg text-ink placeholder:text-ink-muted focus-visible:outline-none"
          />
        </div>
        <ul
          id={`${id}-list`}
          role="listbox"
          aria-label={`${NOUN[kind]} suggestions`}
          hidden={!showList}
          className="absolute inset-x-0 top-full z-30 mt-2 grid border border-line-strong bg-surface-2 py-1 shadow-[0_16px_32px_rgb(0_0_0/0.45)]"
        >
          {options.map((option, i) => (
            <li
              key={option.id}
              id={`${id}-option-${i}`}
              role="option"
              aria-selected={i === current}
              // Keeps the focus in the field, so the list does not close before the click lands.
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => go(option)}
              onMouseEnter={() => setActive(i)}
              className={cn(
                'flex cursor-pointer items-baseline justify-between gap-4 px-4 py-2.5',
                i === current && 'bg-surface-3',
              )}
            >
              <span className="min-w-0 truncate">
                <span className="font-semibold">{option.label}</span>
                {option.detail ? <span className="text-ink-muted">, {option.detail}</span> : null}
              </span>
              <span className="shrink-0 text-sm text-ink-muted tabular-nums">{option.meta}</span>
            </li>
          ))}
        </ul>
      </div>
      <p id={`${id}-status`} aria-live="polite" className="min-h-5 text-sm text-ink-muted">
        {status}
      </p>
    </div>
  )
}
