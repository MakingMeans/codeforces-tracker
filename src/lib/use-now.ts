import { useEffect, useState } from 'react'

/** The current time, refreshed every `intervalMs`, for countdowns and "x ago" labels. */
export function useNow(intervalMs: number) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), intervalMs)
    return () => clearInterval(timer)
  }, [intervalMs])
  return now
}
