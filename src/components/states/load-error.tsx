import { CloudOff, RotateCw, ServerCrash, UserX, WifiOff } from 'lucide-react'
import type { LoadProblem } from '../../lib/errors'
import { linkHandler, routeHref } from '../../lib/route'
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
      }
    >
      {notFound ? (
        <p>
          No Codeforces account is called <span className="font-semibold break-all text-ink">“{handle}”</span>. Check
          the spelling; handles are 3 to 24 characters.
        </p>
      ) : (
        <p>{problem.detail}</p>
      )}
    </StateMessage>
  )
}
