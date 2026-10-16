import { CloudOff, RotateCw, ServerCrash, UserX, WifiOff } from 'lucide-react'
import type { LoadProblem } from '../../lib/errors'
import { linkHandler, routeHref } from '../../lib/route'
import { SearchBox } from '../search/search-box'
import { Button, ButtonLink } from '../ui/button'
import { StateMessage } from './state-message'

const ICONS = {
  'not-found': UserX,
  offline: WifiOff,
  network: CloudOff,
  'rate-limited': ServerCrash,
  unavailable: ServerCrash,
  api: ServerCrash,
}

/** A failed load in place of the profile: not found, offline, Codeforces busy or down. */
export function LoadError({ problem, handle, onRetry }: { problem: LoadProblem; handle: string; onRetry: () => void }) {
  const notFound = problem.kind === 'not-found'
  return (
    <StateMessage
      icon={ICONS[problem.kind]}
      tone="error"
      title={problem.title}
      actions={
        notFound ? (
          <SearchBox variant="fix" initial={handle} label="Correct the handle" />
        ) : (
          <>
            {problem.retry ? (
              <Button variant="primary" onClick={onRetry}>
                <RotateCw aria-hidden />
                Try again
              </Button>
            ) : null}
            <ButtonLink href={routeHref({})} onClick={linkHandler({})} variant="secondary">
              Back to search
            </ButtonLink>
          </>
        )
      }
    >
      {notFound ? (
        <p>
          No Codeforces account is called <span className="font-semibold break-all text-ink">“{handle}”</span>. Check
          the spelling and try again.
        </p>
      ) : (
        <p>{problem.detail}</p>
      )}
    </StateMessage>
  )
}
