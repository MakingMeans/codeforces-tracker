import type { CodeforcesErrorKind } from './api/client'
import type { ApiContest } from './api/types'
import type { ProfileDetails } from './codeforces/details'

/** Messages to the details worker. */
export type DetailsRequest =
  | { type: 'load'; id: number; handle: string }
  | { type: 'contests'; id: number; contests: ApiContest[] }
  | { type: 'cancel'; id: number }

/** Messages from the details worker. Errors travel as plain data: class instances do not survive postMessage. */
export type DetailsResponse =
  | { type: 'done'; id: number; details: ProfileDetails }
  | { type: 'error'; id: number; kind: CodeforcesErrorKind; message: string }
