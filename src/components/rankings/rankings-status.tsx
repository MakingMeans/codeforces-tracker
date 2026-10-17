import { CloudOff, RotateCw } from 'lucide-react'
import type { RankingsState } from '../../lib/rankings/load'
import { StateMessage } from '../states/state-message'
import { Button } from '../ui/button'
import { ScanLoader } from '../ui/scan-loader'

/** While the daily rankings load, or why they cannot. */
export function RankingsStatus({
  state,
  onRetry,
}: {
  state: Exclude<RankingsState, { status: 'ready' }>
  onRetry: () => void
}) {
  if (state.status === 'loading') {
    return (
      <div aria-busy="true" className="grid gap-4">
        <ScanLoader label="Loading the rankings…" />
        <div className="h-72 animate-pulse bg-surface-2/70" />
      </div>
    )
  }
  if (state.status === 'missing') {
    return (
      <StateMessage icon={CloudOff} title="Rankings unavailable">
        <p>This version of the site was published without the daily rankings. They come back with the next update.</p>
      </StateMessage>
    )
  }
  return (
    <StateMessage
      icon={CloudOff}
      tone="error"
      title="Could not load the rankings"
      actions={
        <Button variant="primary" onClick={onRetry}>
          <RotateCw aria-hidden />
          Try again
        </Button>
      }
    >
      <p>{state.message}</p>
    </StateMessage>
  )
}
