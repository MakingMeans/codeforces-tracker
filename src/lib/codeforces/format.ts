const MINUS = '−'

/** A rating change as Codeforces prints it, with a true minus sign: +62, −33, 0. */
export const formatDelta = (delta: number) => (delta > 0 ? `+${delta}` : delta < 0 ? `${MINUS}${-delta}` : '0')

export const formatNumber = (value: number) => value.toLocaleString('en-US')

/** "Oct 12, 2026" */
export const formatDate = (time: number) =>
  new Date(time).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

/** "2h 15m", "2h", "45m"; empty for 0 (contests whose length is unknown). */
export function formatDuration(seconds: number) {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.round((seconds % 3600) / 60)
  return [hours ? `${hours}h` : '', minutes ? `${minutes}m` : ''].filter(Boolean).join(' ')
}

/** "1 contest", "3 contests" */
export const plural = (count: number, word: string, many = `${word}s`) =>
  `${formatNumber(count)} ${count === 1 ? word : many}`
