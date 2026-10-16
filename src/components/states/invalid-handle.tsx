import { TriangleAlert } from 'lucide-react'
import { linkHandler, routeHref } from '../../lib/route'
import { ButtonLink } from '../ui/button'
import { StateMessage } from './state-message'

/** Shown for `?handle=` values that cannot be a handle, before asking Codeforces anything. */
export function InvalidHandle({ handle, problem }: { handle: string; problem: string }) {
  return (
    <StateMessage
      icon={TriangleAlert}
      tone="error"
      title="Not a valid handle"
      actions={
        <ButtonLink href={routeHref({})} onClick={linkHandler({})} variant="secondary">
          Back to search
        </ButtonLink>
      }
    >
      <p>
        <span className="font-semibold break-all text-ink">“{handle}”</span> cannot be a Codeforces handle. {problem}
      </p>
    </StateMessage>
  )
}
