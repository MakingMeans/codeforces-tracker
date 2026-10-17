import { Plus, Users } from 'lucide-react'
import { useId, useState, type FormEvent } from 'react'
import { Button } from '../components/ui/button'
import { fieldClass } from '../components/ui/field-class'
import { Panel } from '../components/ui/panel'
import { plural } from '../lib/codeforces/format'
import { createGroup, MAX_MEMBERS, MAX_NAME, parseMembers, useGroups } from '../lib/groups'
import { linkHandler, navigate, routeHref } from '../lib/route'

const field = fieldClass('w-full')
const label = 'font-label text-[13px] font-semibold tracking-[0.16em] text-ink-muted uppercase'

function NewGroup() {
  const [name, setName] = useState('')
  const [members, setMembers] = useState('')
  const [problem, setProblem] = useState<string | null>(null)
  const id = useId()

  function submit(event: FormEvent) {
    event.preventDefault()
    if (!name.trim()) return setProblem('Give the group a name.')
    const handles = parseMembers(members)
    const group = createGroup(name, handles)
    navigate({ group: group.id })
  }

  return (
    <Panel title="New group">
      <form onSubmit={submit} noValidate className="grid gap-4">
        <div className="grid gap-1.5">
          <label htmlFor={`${id}-name`} className={label}>
            Name
          </label>
          <input
            id={`${id}-name`}
            value={name}
            maxLength={MAX_NAME}
            onChange={(event) => {
              setName(event.target.value)
              setProblem(null)
            }}
            placeholder="e.g. ICPC team, my class"
            aria-invalid={problem ? true : undefined}
            aria-describedby={`${id}-problem`}
            className={field}
          />
        </div>
        <div className="grid gap-1.5">
          <label htmlFor={`${id}-members`} className={label}>
            Members
          </label>
          <textarea
            id={`${id}-members`}
            value={members}
            onChange={(event) => setMembers(event.target.value)}
            rows={3}
            placeholder="Handles, separated by commas or spaces"
            aria-describedby={`${id}-hint`}
            className={`${field} resize-y`}
          />
          <p id={`${id}-hint`} className="text-sm text-ink-muted">
            Up to {MAX_MEMBERS}. You can add more later, or from any profile.
          </p>
        </div>
        <p id={`${id}-problem`} aria-live="polite" className="text-sm text-accent empty:hidden">
          {problem}
        </p>
        <Button type="submit" variant="primary" className="justify-self-start">
          <Plus aria-hidden />
          Create group
        </Button>
      </form>
    </Panel>
  )
}

/** The visitor's groups, and a form for a new one. */
export function GroupsHome() {
  const groups = useGroups()

  return (
    <>
      <section aria-labelledby="groups-title" className="ticks border-b border-line">
        <div className="mx-auto grid max-w-[1240px] gap-3 px-4 py-10 sm:px-6 sm:py-14">
          <p className="font-label text-[13px] font-semibold tracking-[0.18em] text-ink-muted uppercase">
            Your lists of players
          </p>
          <h1 id="groups-title" className="font-display text-[clamp(40px,7vw,72px)] leading-none uppercase">
            Groups
          </h1>
          <p className="max-w-[64ch] text-lg text-ink-muted">
            Friends, a team, a class: put them in a group to see them ranked, with their average and the rating of their
            best team of three. Groups stay in this browser; share a group’s link to show it to anyone.
          </p>
        </div>
      </section>
      <div className="mx-auto grid max-w-[1240px] grid-cols-[minmax(0,1fr)] items-start gap-4 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <Panel title="Your groups" aside={groups.length ? plural(groups.length, 'group') : undefined}>
          {groups.length === 0 ? (
            <p className="text-ink-muted">
              No groups yet. Create one with the form, or with “Add to group” on a profile.
            </p>
          ) : (
            <ul className="grid gap-2">
              {groups.map((group) => (
                <li key={group.id}>
                  <a
                    href={routeHref({ group: group.id })}
                    onClick={linkHandler({ group: group.id })}
                    className="cut grid gap-1 px-4 py-3 [--cut:10px] [--cut-fill:var(--color-surface-2)] hover:[--cut-fill:var(--color-surface-3)]"
                  >
                    <span className="flex items-center gap-2.5 font-semibold">
                      <Users aria-hidden className="h-4 w-4 text-ink-muted" />
                      {group.name}
                    </span>
                    <span className="truncate text-sm text-ink-muted">
                      {group.members.length
                        ? `${plural(group.members.length, 'member')} · ${group.members.slice(0, 6).join(', ')}${group.members.length > 6 ? '…' : ''}`
                        : 'No members yet'}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </Panel>
        <NewGroup />
      </div>
    </>
  )
}
