import { useId, useMemo, useState, type InputHTMLAttributes, type KeyboardEvent, type Ref } from 'react'
import { cn } from '../../lib/cn'
import { rankFor } from '../../lib/codeforces/ranks'
import { cleanHandle } from '../../lib/handle'
import { useRankings } from '../../lib/rankings/load'
import type { HandleSuggestion } from '../../lib/rankings/rankings'
import { useRecentSearches } from '../../lib/recent-searches'
import { RankEmblem } from '../rank-emblem'

interface Option {
  handle: string
  rating: number | null
  /** The country, or "Recent" for a past search. */
  note?: string
}

type HandleFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> & {
  value: string
  onValueChange: (value: string) => void
  /** A suggestion was chosen, with the mouse or Enter. */
  onPick: (handle: string) => void
  ref?: Ref<HTMLInputElement>
  /** Classes for the suggestion list, positioned against the nearest `relative` parent. */
  listClassName?: string
}

const MAX = 8

/**
 * A handle input that suggests players as you type: rated players from the daily
 * rankings whose handle starts with (then contains) what was typed, best first,
 * and past searches while it is empty. Enter on a highlighted suggestion picks
 * it; otherwise Enter submits what was typed, so any handle can still be looked up.
 */
export function HandleField({
  value,
  onValueChange,
  onPick,
  listClassName,
  className,
  ref,
  ...input
}: HandleFieldProps) {
  const [wanted, setWanted] = useState(false)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const { state } = useRankings(wanted)
  const recent = useRecentSearches()
  const id = useId()
  const query = cleanHandle(value)

  const options = useMemo<Option[]>(() => {
    const rankings = state.status === 'ready' ? state.rankings : null
    const fromRecent = (handle: string): Option => ({
      handle,
      rating: rankings?.find(handle)?.rating ?? null,
      note: 'Recent',
    })
    if (!query) return recent.slice(0, 5).map(fromRecent)
    if (!rankings) {
      const lower = query.toLowerCase()
      return recent
        .filter((handle) => handle.toLowerCase().startsWith(lower))
        .slice(0, MAX)
        .map(fromRecent)
    }
    return rankings
      .suggestHandles(query, MAX)
      .map(({ handle, rating, country }: HandleSuggestion) => ({ handle, rating, note: country }))
  }, [state, query, recent])

  const showList = open && options.length > 0
  const current = active < options.length ? active : -1

  function pick(option: Option) {
    setOpen(false)
    setActive(-1)
    onPick(option.handle)
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      if (!options.length) return
      event.preventDefault()
      setOpen(true)
      const step = event.key === 'ArrowDown' ? 1 : -1
      setActive((index) =>
        index < 0 && step < 0 ? options.length - 1 : (index + step + options.length) % options.length,
      )
    } else if (event.key === 'Enter' && showList && current >= 0) {
      event.preventDefault()
      pick(options[current])
    } else if (event.key === 'Escape' && showList) {
      event.preventDefault()
      setOpen(false)
    }
    // Keys the list did not use are the page's: Escape closing a form, for instance.
    if (!event.defaultPrevented) input.onKeyDown?.(event)
  }

  return (
    <>
      <input
        {...input}
        ref={ref}
        role="combobox"
        aria-expanded={showList}
        aria-controls={`${id}-list`}
        aria-autocomplete="list"
        aria-activedescendant={showList && current >= 0 ? `${id}-option-${current}` : undefined}
        value={value}
        onChange={(event) => {
          onValueChange(event.target.value)
          setActive(-1)
          setOpen(true)
        }}
        onFocus={(event) => {
          setWanted(true)
          setOpen(true)
          input.onFocus?.(event)
        }}
        onBlur={(event) => {
          setOpen(false)
          setActive(-1)
          input.onBlur?.(event)
        }}
        onKeyDown={onKeyDown}
        className={className}
      />
      <ul
        id={`${id}-list`}
        role="listbox"
        aria-label="Suggested players"
        hidden={!showList}
        className={cn(
          'absolute inset-x-0 top-full z-40 mt-2 grid border border-line-strong bg-surface-2 py-1 text-left shadow-[0_16px_32px_rgb(0_0_0/0.45)]',
          listClassName,
        )}
      >
        {/* Drawn only while open: each row carries an emblem. */}
        {(showList ? options : []).map((option, i) => {
          const rank = rankFor(option.rating)
          return (
            <li
              key={option.handle}
              id={`${id}-option-${i}`}
              role="option"
              aria-selected={i === current}
              // Keeps the focus in the field, so the list does not close before the click lands.
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => pick(option)}
              onMouseEnter={() => setActive(i)}
              className={cn('flex cursor-pointer items-center gap-3 px-3 py-2', i === current && 'bg-surface-3')}
            >
              <RankEmblem rank={rank} size={32} />
              <span className="min-w-0 flex-1 truncate font-semibold" style={{ color: rank.color }}>
                {option.handle}
              </span>
              <span className="shrink-0 text-sm text-ink-muted tabular-nums">
                {[option.rating, option.note].filter((part) => part !== null && part !== undefined).join(' · ')}
              </span>
            </li>
          )
        })}
      </ul>
    </>
  )
}
