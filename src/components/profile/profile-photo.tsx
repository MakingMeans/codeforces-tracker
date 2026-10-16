import { useState } from 'react'
import { cn } from '../../lib/cn'
import { asset } from '../../lib/site'

/** Shown when none of Codeforces' photo URLs loads. */
const FALLBACK = asset('fallback-avatar.svg')

interface ProfilePhotoProps {
  /** Tried in order; the local fallback comes after the last. */
  sources: string[]
  handle: string
  color: string
  className?: string
}

/** The Codeforces photo in a cut frame of the rank's colour. */
export function ProfilePhoto({ sources, handle, color, className }: ProfilePhotoProps) {
  const [attempt, setAttempt] = useState(0)

  return (
    <div
      className={cn(
        'shrink-0 p-[2px] [clip-path:polygon(16px_0,100%_0,100%_calc(100%-16px),calc(100%-16px)_100%,0_100%,0_16px)]',
        className,
      )}
      style={{ backgroundColor: color }}
    >
      <img
        src={sources[attempt] ?? FALLBACK}
        onError={() => setAttempt((value) => Math.min(value + 1, sources.length))}
        alt={`Profile photo of ${handle}`}
        referrerPolicy="no-referrer"
        decoding="async"
        className="block h-full w-full bg-surface-2 object-cover object-top [clip-path:polygon(15px_0,100%_0,100%_calc(100%-15px),calc(100%-15px)_100%,0_100%,0_15px)]"
      />
    </div>
  )
}
