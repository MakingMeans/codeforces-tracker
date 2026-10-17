import { Check, Link2, Pencil, Plus, RotateCw, Save, Trash2, UserMinus, Users } from 'lucide-react'
import { useId, useMemo, useState, type FormEvent } from 'react'
import { PlayerTable, type PlayerRow } from '../components/rankings/player-table'
import { StatTiles } from '../components/rankings/stat-tiles'
import { StateMessage } from '../components/states/state-message'
import { Button, ButtonLink } from '../components/ui/button'
import { fieldClass } from '../components/ui/field-class'
import { Panel } from '../components/ui/panel'
import { ScanLoader } from '../components/ui/scan-loader'
import { call, CodeforcesError } from '../lib/api/client'
import type { ApiUser } from '../lib/api/types'
import { divisionFor, rankFor, romanFor } from '../lib/codeforces/ranks'
import { topThreeTeamRating } from '../lib/codeforces/team-rating'
import { describeLoadError } from '../lib/errors'
import { useGroupMembers, type Member } from '../lib/group-members'
import {
  cleanName,
  deleteGroup,
  hasMember,
  MAX_MEMBERS,
  MAX_NAME,
  newGroupId,
  parseMembers,
  saveGroup,
  useGroups,
  withMember,
  withoutMember,
  type Group,
} from '../lib/groups'
import { cleanHandle, handleProblem } from '../lib/handle'
import { linkHandler, navigate, routeHref } from '../lib/route'

const field = fieldClass('w-full')

/** Places among rated members, equal ratings sharing one; the unrated get none. */
function placed(members: Member[]) {
  const places: (number | null)[] = []
  members.forEach((member, i) => {
    if (member.rating === null) places.push(null)
    else places.push(i > 0 && members[i - 1].rating === member.rating ? places[i - 1] : i + 1)
  })
  return places
}

function AddMember({ group }: { group: Group }) {
  const [value, setValue] = useState('')
  const [problem, setProblem] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const id = useId()

  async function submit(event: FormEvent) {
    event.preventDefault()
    const handle = cleanHandle(value)
    const invalid = handleProblem(value)
    if (invalid) return setProblem(invalid)
    if (hasMember(group, handle)) return setProblem(`${handle} is already in this group.`)
    if (group.members.length >= MAX_MEMBERS) return setProblem(`A group holds up to ${MAX_MEMBERS} players.`)
    setBusy(true)
    try {
      // Checked with Codeforces first, which also gives the handle its own capitalisation.
      const [user] = await call<ApiUser[]>('user.info', { handles: handle })
      saveGroup({ ...group, members: withMember(group.members, user.handle) })
      setValue('')
      setProblem(null)
    } catch (error) {
      setProblem(
        error instanceof CodeforcesError && error.kind === 'not-found'
          ? `No Codeforces account is called “${handle}”.`
          : describeLoadError(error).title,
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} noValidate className="grid gap-1.5">
      <div className="flex gap-2">
        <label htmlFor={`${id}-handle`} className="sr-only">
          Handle to add
        </label>
        <input
          id={`${id}-handle`}
          value={value}
          onChange={(event) => {
            setValue(event.target.value)
            setProblem(null)
          }}
          placeholder="Add a handle"
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          aria-invalid={problem ? true : undefined}
          aria-describedby={`${id}-problem`}
          className={field}
        />
        <Button type="submit" disabled={busy} className="shrink-0">
          <Plus aria-hidden />
          Add
        </Button>
      </div>
      <p id={`${id}-problem`} aria-live="polite" className="text-sm text-accent empty:hidden">
        {problem}
      </p>
    </form>
  )
}

function Rename({ group, onDone }: { group: Group; onDone: () => void }) {
  const [name, setName] = useState(group.name)
  const id = useId()
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        if (cleanName(name)) saveGroup({ ...group, name: cleanName(name) })
        onDone()
      }}
      className="flex flex-wrap items-center gap-2"
    >
      <label htmlFor={`${id}-name`} className="sr-only">
        Group name
      </label>
      <input
        id={`${id}-name`}
        value={name}
        maxLength={MAX_NAME}
        onChange={(event) => setName(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') onDone()
        }}
        autoFocus
        className={`${field} max-w-[24rem] font-display text-2xl uppercase`}
      />
      <Button type="submit" variant="primary">
        <Check aria-hidden />
        Save
      </Button>
      <Button variant="ghost" onClick={onDone}>
        Cancel
      </Button>
    </form>
  )
}

function GroupView({ group, saved }: { group: Group; saved: boolean }) {
  const { state, retry } = useGroupMembers(group.members)
  const [renaming, setRenaming] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [copied, setCopied] = useState(false)

  const shareHref = routeHref({ group: group.id, name: group.name, members: group.members.join(',') })
  const members = useMemo(() => (state.status === 'ready' ? state.members : []), [state])
  const ratings = members.flatMap((member) => (member.rating === null ? [] : [member.rating]))
  const average = ratings.length ? Math.round(ratings.reduce((a, b) => a + b, 0) / ratings.length) : null
  const team = topThreeTeamRating(ratings)
  const places = useMemo(() => placed(members), [members])

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(new URL(shareHref, location.origin).href)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      window.prompt('Copy this link', new URL(shareHref, location.origin).href)
    }
  }

  const rows: PlayerRow[] = members.map((member, i) => ({
    key: member.handle,
    position: places[i],
    handle: member.handle,
    rating: member.rating,
    maxRating: member.maxRating,
    extra: [
      member.rating === null ? null : (
        <span style={{ color: member.rank.color }}>
          {member.rank.name} {romanFor(divisionFor(member.rating))}
        </span>
      ),
    ],
    action: saved ? (
      <button
        type="button"
        onClick={() => saveGroup({ ...group, members: withoutMember(group.members, member.handle) })}
        aria-label={`Remove ${member.handle} from ${group.name}`}
        className="inline-grid h-8 w-8 cursor-pointer place-items-center text-ink-muted hover:text-accent"
      >
        <UserMinus aria-hidden className="h-4 w-4" />
      </button>
    ) : null,
  }))

  return (
    <>
      <section aria-labelledby="group-title" className="ticks border-b border-line">
        <div className="mx-auto flex max-w-[1240px] flex-wrap items-end justify-between gap-6 px-4 py-8 sm:px-6">
          <div className="grid min-w-0 gap-2">
            <p className="flex flex-wrap gap-x-2 text-sm text-ink-muted">
              <a
                href={routeHref({ groups: true })}
                onClick={linkHandler({ groups: true })}
                className="underline underline-offset-3 hover:text-ink"
              >
                Groups
              </a>
              <span aria-hidden>›</span>
              <span>{saved ? 'Yours · saved in this browser' : 'Shared with you'}</span>
            </p>
            {renaming ? (
              <Rename group={group} onDone={() => setRenaming(false)} />
            ) : (
              <h1
                id="group-title"
                className="font-display text-[clamp(34px,5.5vw,56px)] leading-none break-words uppercase"
              >
                {group.name}
              </h1>
            )}
          </div>
          <StatTiles
            items={[
              { label: 'Members', value: group.members.length },
              { label: 'Average', value: average ?? '—', color: rankFor(average).color },
              { label: 'Team rating · top 3', value: team ?? '—', color: rankFor(team).color },
            ]}
          />
        </div>
      </section>

      <div className="mx-auto grid max-w-[1240px] grid-cols-[minmax(0,1fr)] gap-4 px-4 py-6 sm:px-6">
        <div className="flex flex-wrap items-center gap-2">
          {saved ? (
            <>
              <Button variant="primary" onClick={copyLink}>
                {copied ? <Check aria-hidden /> : <Link2 aria-hidden />}
                {copied ? 'Link copied' : 'Copy share link'}
              </Button>
              <Button onClick={() => setRenaming(true)} disabled={renaming}>
                <Pencil aria-hidden />
                Rename
              </Button>
              {confirming ? (
                <span className="flex flex-wrap items-center gap-2">
                  <span className="text-sm">Delete “{group.name}” from this browser?</span>
                  <Button
                    variant="primary"
                    onClick={() => {
                      deleteGroup(group.id)
                      navigate({ groups: true }, { replace: true })
                    }}
                  >
                    <Trash2 aria-hidden />
                    Delete
                  </Button>
                  <Button variant="ghost" onClick={() => setConfirming(false)}>
                    Keep it
                  </Button>
                </span>
              ) : (
                <Button variant="ghost" onClick={() => setConfirming(true)}>
                  <Trash2 aria-hidden />
                  Delete
                </Button>
              )}
            </>
          ) : (
            <>
              <Button
                variant="primary"
                onClick={() => {
                  saveGroup(group)
                  navigate({ group: group.id }, { replace: true })
                }}
              >
                <Save aria-hidden />
                Save to my groups
              </Button>
              <span className="text-sm text-ink-muted">
                Saving lets you edit it and see it on its members’ profiles.
              </span>
            </>
          )}
        </div>

        {saved ? <AddMember group={group} /> : null}

        <Panel title="Members" aside="Ratings live from Codeforces">
          {group.members.length === 0 ? (
            <p className="text-ink-muted">No members yet. Add a handle above, or use “Add to group” on any profile.</p>
          ) : state.status === 'loading' ? (
            <div aria-busy="true" className="grid gap-3">
              <ScanLoader label={`Fetching ${group.members.length} players…`} />
              <div className="h-40 animate-pulse bg-surface-2/70" />
            </div>
          ) : state.status === 'error' ? (
            <div className="grid justify-items-start gap-3 text-sm text-ink-muted">
              <p>
                <span className="font-semibold text-ink">{state.problem.title}.</span> {state.problem.detail}
              </p>
              {state.problem.retry ? (
                <Button variant="primary" onClick={retry}>
                  <RotateCw aria-hidden />
                  Try again
                </Button>
              ) : null}
            </div>
          ) : (
            <>
              {state.missing.length ? (
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <p className="text-ink-muted">
                    Not found on Codeforces: <span className="text-ink">{state.missing.join(', ')}</span>.
                  </p>
                  {saved ? (
                    <Button
                      variant="ghost"
                      onClick={() =>
                        saveGroup({ ...group, members: state.missing.reduce(withoutMember, group.members) })
                      }
                    >
                      Remove them
                    </Button>
                  ) : null}
                </div>
              ) : null}
              <PlayerTable caption={`Members of ${group.name}`} extraColumns={['Rank']} rows={rows} hasAction={saved} />
              <p className="text-sm text-ink-muted">
                Team rating · top 3 is Codeforces’ team formula on the three best members: the rating of a player the
                team would beat half the time, the team winning if any member wins.
              </p>
            </>
          )}
        </Panel>
      </div>
    </>
  )
}

interface GroupPageProps {
  id: string
  /** Name and members from a shared link. */
  sharedName: string | null
  sharedMembers: string | null
}

/** One group: saved in this browser, or opened from a shared link. */
export function GroupPage({ id, sharedName, sharedMembers }: GroupPageProps) {
  const groups = useGroups()
  const saved = groups.find((group) => group.id === id)
  const shared = useMemo<Group | null>(
    () =>
      sharedMembers !== null
        ? {
            id: /^[a-z0-9]{6,16}$/.test(id) ? id : newGroupId(),
            name: cleanName(sharedName ?? '') || 'Shared group',
            members: parseMembers(sharedMembers),
          }
        : null,
    [id, sharedName, sharedMembers],
  )

  const group = saved ?? shared
  if (!group) {
    return (
      <StateMessage
        icon={Users}
        title="Group not found"
        actions={
          <ButtonLink href={routeHref({ groups: true })} onClick={linkHandler({ groups: true })}>
            Your groups
          </ButtonLink>
        }
      >
        <p>It may have been deleted, or saved in another browser. Groups stay in the browser that made them.</p>
      </StateMessage>
    )
  }
  return <GroupView group={group} saved={Boolean(saved)} />
}
