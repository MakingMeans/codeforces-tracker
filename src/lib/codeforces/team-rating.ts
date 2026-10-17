/**
 * Codeforces' team rating (https://codeforces.com/blog/entry/16986): the rating R
 * of a single player the team would beat half the time, where the team wins if
 * any one member beats them. With the Elo win chance, that is the R for which
 *
 *   ∏ 1 / (1 + 10^((rᵢ − R) / 400)) = 1/2      (the chance every member loses to R)
 *
 * found by bisection. One member gives their own rating; three of 2000 give 2234.
 */
export function teamRating(ratings: number[]): number | null {
  if (ratings.length === 0) return null
  let lo = Math.min(...ratings)
  let hi = Math.max(...ratings) + 400 * Math.log10(2 ** ratings.length) + 1
  for (let step = 0; step < 60; step++) {
    const r = (lo + hi) / 2
    const allLose = ratings.reduce((chance, rating) => chance / (1 + 10 ** ((rating - r) / 400)), 1)
    if (allLose < 0.5) lo = r
    else hi = r
  }
  return Math.round((lo + hi) / 2)
}

/** The team rating of the best three: the strongest team of three a country, city or organization could field. */
export const topThreeTeamRating = (ratings: number[]) => teamRating([...ratings].sort((a, b) => b - a).slice(0, 3))
