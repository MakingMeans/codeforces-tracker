/**
 * Summaries drawn from data already loaded for the profile: no extra calls.
 */
import type { ApiSubmission } from '../api/types'
import { problemKey } from './activity'
import { isRated, type ContestEntry } from './contests'

export interface ContestSummary {
  total: number
  rated: number
  unrated: number
  pending: number
  /** Best final place in a rated contest. */
  bestPlace: number | null
  /** Largest gain, leaving out the first rated contest (its jump from 0 would always win). */
  bestGain: number | null
  worstLoss: number | null
}

export function contestSummary(contests: ContestEntry[]): ContestSummary {
  const rated = contests.filter(isRated)
  const deltas = rated.filter((contest) => contest.before > 0).map((contest) => contest.after - contest.before)
  const places = rated.flatMap((contest) => (contest.place ? [contest.place] : []))
  const gains = deltas.filter((delta) => delta > 0)
  const losses = deltas.filter((delta) => delta < 0)

  return {
    total: contests.length,
    rated: rated.length,
    unrated: contests.filter((contest) => contest.outcome === 'unrated').length,
    pending: contests.filter((contest) => contest.outcome === 'pending').length,
    bestPlace: places.length ? Math.min(...places) : null,
    bestGain: gains.length ? Math.max(...gains) : null,
    worstLoss: losses.length ? Math.min(...losses) : null,
  }
}

/** Each solved problem once (its first accepted submission). */
function solvedProblems(submissions: ApiSubmission[]) {
  const solved = new Map<string, ApiSubmission>()
  for (const submission of submissions) {
    if (submission.verdict === 'OK' && !solved.has(problemKey(submission)))
      solved.set(problemKey(submission), submission)
  }
  return [...solved.values()]
}

export interface DifficultyBucket {
  rating: number
  count: number
}

/** Solved problems per difficulty, every 100 from 800 to the hardest solved, gaps included. */
export function solvedByDifficulty(submissions: ApiSubmission[]) {
  const counts = new Map<number, number>()
  let withoutRating = 0
  for (const { problem } of solvedProblems(submissions)) {
    if (problem.rating === undefined) withoutRating += 1
    else counts.set(problem.rating, (counts.get(problem.rating) ?? 0) + 1)
  }
  const hardest = Math.max(800, ...counts.keys())
  const buckets: DifficultyBucket[] = []
  for (let rating = 800; rating <= hardest; rating += 100) buckets.push({ rating, count: counts.get(rating) ?? 0 })
  return { buckets: counts.size ? buckets : [], withoutRating }
}

export interface TagCount {
  tag: string
  count: number
}

/** The tags of solved problems, most frequent first. */
export function topTags(submissions: ApiSubmission[], limit = 8): TagCount[] {
  const counts = new Map<string, number>()
  for (const { problem } of solvedProblems(submissions)) {
    for (const tag of problem.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1)
  }
  return [...counts]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag))
    .slice(0, limit)
}

/** Codeforces lists compilers ("GNU G++20 13.2 (64 bit, winlibs)"); these group them by language. */
const FAMILIES: Array<[string, RegExp]> = [
  ['C++', /c\+\+|g\+\+|clang\+\+/i],
  // Before C, whose pattern would also match "C# 10".
  ['C#', /c#|mono|\.net/i],
  ['C', /\bgcc\b|\bc11\b|^gnu c\b|^c\b/i],
  ['Python', /python|pypy/i],
  ['Java', /java(?!script)/i],
  ['Kotlin', /kotlin/i],
  ['Rust', /rust/i],
  ['Go', /^go\b|golang/i],
  ['JavaScript', /javascript|node\.?js|\bv8\b/i],
  ['TypeScript', /typescript/i],
  ['Haskell', /haskell/i],
  ['Ruby', /ruby/i],
  ['PHP', /php/i],
  ['Pascal', /pascal|delphi|\bfpc\b/i],
  ['Scala', /scala/i],
  ['OCaml', /ocaml/i],
  ['Perl', /perl/i],
  ['D', /^d\b|\bdmd\b/i],
]

export function languageFamily(compiler: string) {
  return FAMILIES.find(([, pattern]) => pattern.test(compiler))?.[0] ?? (compiler.split(/\s/)[0] || 'Other')
}

export interface LanguageShare {
  language: string
  count: number
  /** Share of all submissions, 0–100. */
  percent: number
}

/** Share of submissions per language; past the top six, the rest fold into "Other". */
export function languageShares(submissions: ApiSubmission[], slots = 6): LanguageShare[] {
  const counts = new Map<string, number>()
  for (const submission of submissions) {
    const language = languageFamily(submission.programmingLanguage)
    counts.set(language, (counts.get(language) ?? 0) + 1)
  }
  const total = submissions.length
  const sorted = [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
  const top = sorted.length > slots ? sorted.slice(0, slots - 1) : sorted
  const rest = sorted.slice(top.length).reduce((sum, [, count]) => sum + count, 0)
  const shares = top.map(([language, count]) => ({ language, count, percent: (count / total) * 100 }))
  if (rest) shares.push({ language: 'Other', count: rest, percent: (rest / total) * 100 })
  return shares
}
