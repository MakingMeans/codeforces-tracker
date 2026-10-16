import { startTransition, useLayoutEffect, useRef, useState } from 'react'

/** Tracks an element's content width, for charts drawn at real pixel size. */
export function useElementWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [width, setWidth] = useState(0)

  useLayoutEffect(() => {
    const element = ref.current
    if (!element) return
    // Redrawing a chart can wait for a moment; typing and scrolling should not.
    const observer = new ResizeObserver(([entry]) =>
      startTransition(() => setWidth(Math.floor(entry.contentRect.width))),
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return [ref, width] as const
}
