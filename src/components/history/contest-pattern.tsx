import type { ContestKind } from '../../lib/codeforces/contest-kind'

/**
 * The texture at the end of each history row, in the slot where Valorant shows
 * the map: dense hatching for Div. 1, wider for Div. 2 and 3, dots for Div. 4,
 * a grid for Educational rounds, chevrons for Global rounds. Rendered once per
 * list and referenced by id from each row.
 */
export function ContestPatternDefs() {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden focusable="false">
      <defs>
        <pattern id="cf-pat-div1" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)">
          <rect width="1.3" height="5" fill="currentColor" />
        </pattern>
        <pattern id="cf-pat-div2" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)">
          <rect width="1.3" height="8" fill="currentColor" />
        </pattern>
        <pattern id="cf-pat-div3" width="13" height="13" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)">
          <rect width="1.3" height="13" fill="currentColor" />
        </pattern>
        <pattern id="cf-pat-div4" width="9" height="9" patternUnits="userSpaceOnUse">
          <rect x="3.5" y="3.5" width="2" height="2" fill="currentColor" />
        </pattern>
        <pattern id="cf-pat-edu" width="12" height="12" patternUnits="userSpaceOnUse">
          <path d="M12 0H0V12" fill="none" stroke="currentColor" strokeWidth="1" />
        </pattern>
        <pattern id="cf-pat-global" width="16" height="12" patternUnits="userSpaceOnUse">
          <path d="M0 10 L8 2 L16 10" fill="none" stroke="currentColor" strokeWidth="1.3" />
        </pattern>
        <pattern id="cf-pat-other" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(30)">
          <rect width="6" height="1.3" fill="currentColor" />
          <rect x="7" y="7" width="6" height="1.3" fill="currentColor" />
        </pattern>
      </defs>
    </svg>
  )
}

export function ContestPattern({ kind }: { kind: ContestKind }) {
  return (
    <svg className="cr-pattern" aria-hidden focusable="false">
      <rect width="100%" height="100%" fill={`url(#cf-pat-${kind})`} />
    </svg>
  )
}
