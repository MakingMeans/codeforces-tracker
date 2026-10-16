/**
 * Shapes of the Codeforces API responses (https://codeforces.com/apiHelp/objects),
 * limited to the fields this site reads.
 */

export interface ApiUser {
  /** With Codeforces' own capitalisation, whatever the visitor typed. */
  handle: string
  /** Absent until the first rated contest. */
  rating?: number
  maxRating?: number
  rank?: string
  maxRank?: string
  titlePhoto: string
  avatar: string
  organization?: string
  city?: string
  country?: string
  contribution: number
  friendOfCount: number
  registrationTimeSeconds: number
  lastOnlineTimeSeconds: number
}

export interface ApiRatingChange {
  contestId: number
  contestName: string
  handle: string
  rank: number
  ratingUpdateTimeSeconds: number
  oldRating: number
  newRating: number
}

export interface ApiProblem {
  /** Absent for problemset-only problems (e.g. acmsguru). */
  contestId?: number
  problemsetName?: string
  index: string
  name: string
  rating?: number
  tags: string[]
}

/** CONTESTANT, PRACTICE, VIRTUAL, MANAGER or OUT_OF_COMPETITION. */
export type ParticipantType = string

export interface ApiSubmission {
  id: number
  contestId?: number
  creationTimeSeconds: number
  problem: ApiProblem
  author: { participantType: ParticipantType }
  programmingLanguage: string
  /** OK, WRONG_ANSWER, COMPILATION_ERROR, TESTING, SKIPPED…; absent while queued. */
  verdict?: string
}

export interface ApiContest {
  id: number
  name: string
  /** BEFORE, CODING, PENDING_SYSTEM_TEST, SYSTEM_TEST or FINISHED. */
  phase: string
  durationSeconds: number
  startTimeSeconds?: number
}

export type ApiResponse<T> = { status: 'OK'; result: T } | { status: 'FAILED'; comment: string }
