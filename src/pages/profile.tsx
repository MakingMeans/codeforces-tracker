import { Construction } from 'lucide-react'
import { StateMessage } from '../components/states/state-message'

/** The profile page for a valid handle. Built in the next step. */
export function Profile({ handle }: { handle: string }) {
  return (
    <StateMessage icon={Construction} title={handle}>
      <p>The profile page is the next piece being built.</p>
    </StateMessage>
  )
}
