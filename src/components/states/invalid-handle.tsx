import { TriangleAlert } from 'lucide-react'
import type { Route } from '../../lib/route'
import { SearchBox } from '../search/search-box'
import { StateMessage } from './state-message'

interface InvalidHandleProps {
  handle: string
  problem: string
  /** Where the corrected handle leads; its profile by default. */
  to?: (handle: string) => Partial<Route>
  /** A handle the correction cannot be, such as the other side of a comparison. */
  exclude?: string
}

/** Shown for `?handle=` values that cannot be a handle, before asking Codeforces anything. */
export function InvalidHandle({ handle, problem, to, exclude }: InvalidHandleProps) {
  return (
    <StateMessage
      icon={TriangleAlert}
      tone="error"
      title="Not a valid handle"
      actions={<SearchBox variant="fix" initial={handle} to={to} exclude={exclude} label="Correct the handle" />}
    >
      <p>
        <span className="font-semibold break-all text-ink">“{handle}”</span> cannot be a Codeforces handle. {problem}
      </p>
    </StateMessage>
  )
}
