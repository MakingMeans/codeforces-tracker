import { Check, Plus, Users } from 'lucide-react'
import { useEffect, useId, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { createGroup, hasMember, saveGroup, useGroups, withMember, withoutMember } from '../../lib/groups'
import { useRankings } from '../../lib/rankings/load'
import { scopeRoute } from '../../lib/rankings/rankings'
import { linkHandler, routeHref, type Route } from '../../lib/route'
import { fieldClass } from '../ui/field-class'

const chip =
  'cut inline-flex items-center gap-2 px-3 py-1.5 text-sm [--cut:7px] [--cut-fill:var(--color-surface)] [--cut-line:var(--color-line-strong)]'

function ChipLink({ route, title, children }: { route: Partial<Route>; title?: string; children: ReactNode }) {
  return (
    <a
      href={routeHref(route)}
      onClick={linkHandler(route)}
      title={title}
      className={cn(chip, 'hover:[--cut-fill:var(--color-surface-2)] hover:[--cut-line:var(--color-ink)]')}
    >
      {children}
    </a>
  )
}

/** Puts the player in one of the visitor's groups, or in a new one. */
function AddToGroup({ handle }: { handle: string }) {
  const groups = useGroups()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const box = useRef<HTMLDivElement>(null)
  const id = useId()

  useEffect(() => {
    if (!open) return
    const close = (event: PointerEvent | KeyboardEvent) => {
      if (event instanceof KeyboardEvent ? event.key === 'Escape' : !box.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('pointerdown', close)
    document.addEventListener('keydown', close)
    return () => {
      document.removeEventListener('pointerdown', close)
      document.removeEventListener('keydown', close)
    }
  }, [open])

  function create(event: FormEvent) {
    event.preventDefault()
    if (!name.trim()) return
    createGroup(name, [handle])
    setName('')
  }

  return (
    <div ref={box} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={`${id}-menu`}
        onClick={() => setOpen((value) => !value)}
        className={cn(chip, 'cursor-pointer text-ink-muted hover:text-ink')}
      >
        <Plus aria-hidden className="h-3.5 w-3.5" />
        Add to group
      </button>
      {open ? (
        <div
          id={`${id}-menu`}
          role="group"
          aria-label={`Groups for ${handle}`}
          className="absolute top-full left-0 z-30 mt-2 grid w-72 gap-3 border border-line-strong bg-surface-2 p-3 shadow-[0_16px_32px_rgb(0_0_0/0.45)]"
        >
          {groups.length ? (
            <ul className="grid gap-1">
              {groups.map((group) => {
                const member = hasMember(group, handle)
                return (
                  <li key={group.id}>
                    <button
                      type="button"
                      aria-pressed={member}
                      onClick={() =>
                        saveGroup({
                          ...group,
                          members: member ? withoutMember(group.members, handle) : withMember(group.members, handle),
                        })
                      }
                      className="flex w-full cursor-pointer items-center gap-2.5 px-2 py-1.5 text-left text-sm hover:bg-surface-3"
                    >
                      <span
                        aria-hidden
                        className={cn(
                          'grid h-4 w-4 shrink-0 place-items-center border',
                          member ? 'border-win bg-win text-bg' : 'border-line-strong',
                        )}
                      >
                        {member ? <Check className="h-3 w-3" /> : null}
                      </span>
                      <span className="min-w-0 truncate">{group.name}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          ) : (
            <p className="text-sm text-ink-muted">No groups yet. Name one to start it with {handle}.</p>
          )}
          <form onSubmit={create} className="flex gap-2">
            <label htmlFor={`${id}-name`} className="sr-only">
              New group name
            </label>
            <input
              id={`${id}-name`}
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="New group"
              className={fieldClass('w-0 flex-1 px-2.5 py-1.5 text-sm')}
            />
            <button
              type="submit"
              className="cursor-pointer bg-accent px-3 font-label text-xs font-bold tracking-[0.12em] text-on-accent uppercase"
            >
              Create
            </button>
          </form>
        </div>
      ) : null}
    </div>
  )
}

/**
 * Under the profile's name: the player's place in their country, city and
 * organization from the daily rankings, the visitor's groups they are in, and
 * "Add to group".
 */
export function ProfileChips({ handle }: { handle: string }) {
  const { state } = useRankings()
  const groups = useGroups()
  const standing = useMemo(() => (state.status === 'ready' ? state.rankings.standing(handle) : []), [state, handle])
  const mine = groups.filter((group) => hasMember(group, handle))

  return (
    <ul aria-label="Rankings and groups" className="mt-2 flex flex-wrap gap-2">
      {standing.map((place) => (
        <li key={place.scope.kind}>
          <ChipLink
            route={{ ...scopeRoute(place.scope), focus: handle }}
            title={`#${place.position} of ${place.total} in today’s ${place.name} ranking`}
          >
            <span className="font-display text-base leading-none">#{place.position}</span>
            <span className="sr-only"> of {place.total} in</span>
            <span className="max-w-[16rem] truncate">{place.name}</span>
          </ChipLink>
        </li>
      ))}
      {mine.map((group) => (
        <li key={group.id}>
          <ChipLink route={{ group: group.id }} title={`In your group ${group.name}`}>
            <Users aria-hidden className="h-3.5 w-3.5 text-ink-muted" />
            <span className="sr-only">In your group </span>
            <span className="max-w-[12rem] truncate">{group.name}</span>
          </ChipLink>
        </li>
      ))}
      <li>
        <AddToGroup handle={handle} />
      </li>
    </ul>
  )
}
