/**
 * The rank emblems as SVG markup: a hex frame that grows with the rank, a chess
 * figure inside and 1–7 stars. Typed port of docs/design/rank-emblems.js;
 * emblem.test.ts checks that both draw exactly the same thing. The rules behind
 * the shapes are in docs/DESIGN.md, "Rank emblems".
 */
import { rankFor, RANKS, romanFor, UNRATED, type Rank } from './codeforces/ranks'

/** One star per rank colour: grey 1, green 2, teal 3, blue 4, violet 5, orange 6, red 7. */
export const STARS = [1, 2, 3, 4, 5, 6, 6, 7, 7, 7]
export const FIGURES = [
  'Pawn',
  'Knight',
  'Bishop',
  'Rook',
  'Queen',
  'King',
  'King',
  'Crowned king',
  'King with mantle',
  'Imperial king',
]
export const starsFor = (tier: number) => (tier < 0 ? 0 : STARS[tier])
const NAVY = '#0F1923'

type Point = [number, number]

const f2 = (n: number) => Math.round(n * 100) / 100
const P = (pts: Point[]) => pts.map(([x, y]) => f2(x) + ',' + f2(y)).join(' ')
const rad = (d: number) => (d * Math.PI) / 180
const polar = (cx: number, cy: number, r: number, deg: number): Point => [
  cx + r * Math.cos(rad(deg)),
  cy + r * Math.sin(rad(deg)),
]
const ringPts = (n: number, r: number, cx: number, cy: number, rot = -90) =>
  Array.from({ length: n }, (_, i) => polar(cx, cy, r, rot + (360 / n) * i))
const starPts = (n: number, ro: number, ri: number, cx: number, cy: number, rot = -90) =>
  Array.from({ length: n * 2 }, (_, i) => polar(cx, cy, i % 2 ? ri : ro, rot + (180 / n) * i))
const poly = (pts: Point[], attrs = '') => '<polygon points="' + P(pts) + '" ' + attrs + '/>'
const FILL = 'fill="currentColor"'
const stroke = (w: number, extra = '') =>
  'fill="none" stroke="currentColor" stroke-width="' + w + '" stroke-linejoin="miter" ' + extra
const diamond = (cx: number, cy: number, w: number, h: number, attrs = FILL) =>
  poly(
    [
      [cx, cy - h / 2],
      [cx + w / 2, cy],
      [cx, cy + h / 2],
      [cx - w / 2, cy],
    ],
    attrs,
  )
const rect = (x0: number, y0: number, x1: number, y1: number, attrs = FILL) =>
  poly(
    [
      [x0, y0],
      [x1, y0],
      [x1, y1],
      [x0, y1],
    ],
    attrs,
  )
const hole = (ink: string) => 'fill="' + ink + '"'
const rays = (n: number, cx: number, cy: number, r0: number, r1: number, half: number, op: number, offset = 0) =>
  Array.from({ length: n }, (_, i) => {
    const a = offset + (360 / n) * i
    return poly(
      [polar(cx, cy, r1, a), polar(cx, cy, r0, a - half), polar(cx, cy, r0, a + half)],
      'fill="currentColor" fill-opacity="' + op + '"',
    )
  }).join('')

// ---------- chess figures (drawn in the 64 box, base centred on 32,43) ----------
const BASE = poly(
  [
    [25, 39.6],
    [39, 39.6],
    [40, 43],
    [24, 43],
  ],
  FILL,
)
const body = (b0: number, b1: number, yb: number) =>
  poly(
    [
      [32 - b0, 39.6],
      [32 + b0, 39.6],
      [32 + b1, yb],
      [32 - b1, yb],
    ],
    FILL,
  )
const collar = (hw: number, y0: number, y1: number) => rect(32 - hw, y0, 32 + hw, y1)
const neck = (hw: number, y0: number, y1: number) =>
  poly(
    [
      [32 - hw - 0.5, y1],
      [32 + hw + 0.5, y1],
      [32 + hw, y0],
      [32 - hw, y0],
    ],
    FILL,
  )

const pawn = () => body(4.6, 2.2, 34.4) + collar(4.4, 33, 34.4) + BASE + poly(ringPts(8, 4.5, 32, 28.6, -67.5), FILL)

const knight = (ink: string) =>
  BASE +
  collar(5, 37.6, 39.6) +
  poly(
    [
      [37, 37.6],
      [37.2, 33],
      [38.4, 30.4],
      [39.6, 28.6],
      [38.6, 27.4],
      [39.2, 25.8],
      [37.6, 24.8],
      [38.2, 23.4],
      [36.6, 22.6],
      [34.2, 19.4],
      [32.4, 21.8],
      [28.2, 22.6],
      [22.6, 27.4],
      [21.6, 30.8],
      [24.6, 32.2],
      [29.4, 30.4],
      [26.8, 35],
      [27.2, 37.6],
    ],
    FILL,
  ) +
  diamond(29.9, 25.9, 2.6, 2.6, hole(ink))

const bishop = (ink: string) =>
  body(4.6, 2.2, 34.8) +
  collar(4.4, 33.4, 34.8) +
  rect(30.4, 32.2, 33.6, 33.6) +
  BASE +
  poly(
    [
      [32, 21.6],
      [35.6, 25.2],
      [36.6, 28.4],
      [35.4, 31.6],
      [33.6, 32.4],
      [30.4, 32.4],
      [28.6, 31.6],
      [27.4, 28.4],
      [28.4, 25.2],
    ],
    FILL,
  ) +
  poly(
    [
      [35.3, 24.9],
      [36.2, 25.8],
      [32.4, 29.6],
      [31.5, 28.7],
    ],
    hole(ink),
  ) +
  diamond(32, 19.8, 3.6, 3.8) +
  rect(31.4, 20.8, 32.6, 22.2)

const rook = () =>
  body(5.2, 3.8, 30.4) +
  collar(4.6, 29, 30.4) +
  BASE +
  poly(
    [
      [28.2, 29],
      [35.8, 29],
      [37.6, 26.8],
      [26.4, 26.8],
    ],
    FILL,
  ) +
  poly(
    [
      [26.4, 26.8],
      [26.4, 21.2],
      [29.2, 21.2],
      [29.2, 23.2],
      [30.6, 23.2],
      [30.6, 21.2],
      [33.4, 21.2],
      [33.4, 23.2],
      [34.8, 23.2],
      [34.8, 21.2],
      [37.6, 21.2],
      [37.6, 26.8],
    ],
    FILL,
  )

// Queen and king share everything below the head: base, body, two collars and a neck.
const ROYAL_LOWER = BASE + body(5, 2.6, 31) + collar(4.6, 29.6, 31) + neck(2.2, 28.4, 29.6) + collar(4, 27.2, 28.4)
const HEAD = 27.2
const KB = 2.6
const KR = 5.8
const RIM = 22.2
const TOP = 21
const crownHalfWidth = (y: number) => KB + ((KR - KB) * (HEAD - y)) / (HEAD - RIM)
const band = (ink: string) =>
  poly(
    [
      [32 - crownHalfWidth(RIM + 1), RIM + 1],
      [32 + crownHalfWidth(RIM + 1), RIM + 1],
      [32 + crownHalfWidth(RIM + 2.1), RIM + 2.1],
      [32 - crownHalfWidth(RIM + 2.1), RIM + 2.1],
    ],
    'fill="' + ink + '" fill-opacity="0.75"',
  )
const CROSS = rect(30.9, 14.6, 33.1, TOP + 0.4) + rect(28.6, 16.2, 35.4, 18.2)
const MANTLE = poly(
  [
    [26, HEAD + 1],
    [38, HEAD + 1],
    [42.6, 39.6],
    [21.4, 39.6],
  ],
  'fill="currentColor" fill-opacity="0.42"',
)
const jewel = (ink: string) => diamond(32, (RIM + HEAD) / 2 + 0.6, 2.4, 2.6, hole(ink))
const CROWN: Point[] = [
  [32 - KB, HEAD],
  [32 - KR, RIM],
  [32 - KR, TOP],
  [32 + KR, TOP],
  [32 + KR, RIM],
  [32 + KB, HEAD],
]
const CROWN_TWO_POINTS: Point[] = [
  [32 - KB, HEAD],
  [32 - KR, RIM],
  [32 - KR - 0.5, TOP - 3.4],
  [32 - KR + 2.8, TOP],
  [32 + KR - 2.8, TOP],
  [32 + KR + 0.5, TOP - 3.4],
  [32 + KR, RIM],
  [32 + KB, HEAD],
]
const CROWN_FIVE_POINTS: Point[] = [
  [32 - KB, HEAD],
  [32 - KR, RIM],
  [32 - KR - 0.5, TOP - 3.6],
  [32 - KR + 2.2, TOP - 1],
  [32 - KR + 3.7, TOP - 3.2],
  [30.7, TOP],
  [33.3, TOP],
  [32 + KR - 3.7, TOP - 3.2],
  [32 + KR - 2.2, TOP - 1],
  [32 + KR + 0.5, TOP - 3.6],
  [32 + KR, RIM],
  [32 + KB, HEAD],
]
const ARCHES: Point[] = [
  [32 - KR, TOP],
  [32 - KR + 1, TOP - 2.6],
  [32 - KR + 3.2, TOP - 4],
  [32, TOP - 4.6],
  [32 + KR - 3.2, TOP - 4],
  [32 + KR - 1, TOP - 2.6],
  [32 + KR, TOP],
]
const CORONET: Point[] = [
  [29.4, HEAD],
  [26.4, 22.6],
  [27.9, 23.6],
  [29.2, 21.6],
  [30.6, 23.4],
  [32, 21.2],
  [33.4, 23.4],
  [34.8, 21.6],
  [36.1, 23.6],
  [37.6, 22.6],
  [34.6, HEAD],
]

const queen = () => ROYAL_LOWER + poly(CORONET, FILL) + rect(31.3, 20.5, 32.7, 21.8) + diamond(32, 18.6, 4.4, 4.6)
const king = (ink: string) => ROYAL_LOWER + poly(CROWN, FILL) + band(ink) + CROSS
const crownedKing = (ink: string) => ROYAL_LOWER + poly(CROWN_TWO_POINTS, FILL) + band(ink) + CROSS
const mantleKing = (ink: string) =>
  MANTLE + ROYAL_LOWER + poly(CROWN_FIVE_POINTS, FILL) + band(ink) + jewel(ink) + CROSS
const imperialKing = (ink: string) =>
  MANTLE +
  ROYAL_LOWER +
  poly(CROWN, FILL) +
  poly(ARCHES, FILL) +
  '<path d="M29.4 ' +
  TOP +
  ' V' +
  (TOP - 2.2) +
  ' L32 ' +
  (TOP - 3.4) +
  ' L34.6 ' +
  (TOP - 2.2) +
  ' V' +
  TOP +
  '" fill="none" stroke="' +
  ink +
  '" stroke-width="0.9" stroke-opacity="0.85"/>' +
  band(ink) +
  jewel(ink) +
  rect(31.1, TOP - 9, 32.9, TOP - 4.3) +
  rect(29.6, TOP - 7.8, 34.4, TOP - 6.2)

const FIGURE: Array<(ink: string) => string> = [
  pawn,
  knight,
  bishop,
  rook,
  queen,
  king,
  king,
  crownedKing,
  mantleKing,
  imperialKing,
]

// ---------- frame ----------
const SCALE = 0.88
const CY = 27.95
const HEX = ringPts(6, 22, 32, 32)
const HEX_IN = ringPts(6, 16.5, 32, 32)
const PLATES =
  poly(
    [
      [11, 24],
      [5, 27],
      [5, 37],
      [11, 40],
    ],
    FILL,
  ) +
  poly(
    [
      [53, 24],
      [59, 27],
      [59, 37],
      [53, 40],
    ],
    FILL,
  )
const WINGS =
  poly(
    [
      [4.5, 19],
      [1, 22],
      [1, 42],
      [4.5, 45],
    ],
    'fill="currentColor" fill-opacity="0.6"',
  ) +
  poly(
    [
      [59.5, 19],
      [63, 22],
      [63, 42],
      [59.5, 45],
    ],
    'fill="currentColor" fill-opacity="0.6"',
  )
const CAP = poly(
  [
    [24, 9.5],
    [32, 3],
    [40, 9.5],
    [32, 6.5],
  ],
  FILL,
)
const OUTER_RING = poly(ringPts(6, 27.5, 32, 32), stroke(1.4, 'stroke-opacity="0.75"'))

// ---------- stars: a ring concentric with the hex ----------
const STAR_R = 4
const RING_R = 22 * SCALE + STAR_R + 5.75
function faceted(x: number, y: number, ink: string) {
  const pts = starPts(5, STAR_R, STAR_R * 0.42, x, y)
  let s = poly(pts, FILL)
  for (let k = 0; k < 5; k++) s += poly([[x, y], pts[2 * k], pts[2 * k + 1]], 'fill="' + ink + '" fill-opacity="0.34"')
  return s
}
function stars(n: number, ink: string) {
  const step = (STAR_R * 2.25) / RING_R
  let s = ''
  for (let i = 0; i < n; i++) {
    const a = Math.PI / 2 - (i - (n - 1) / 2) * step
    s += faceted(32 + RING_R * Math.cos(a), Math.min(CY + RING_R * Math.sin(a), 64 - STAR_R - 0.3), ink)
  }
  return s
}

// ---------- divisions: a roman numeral on a plate over the hex's bottom corner ----------
// A dark plate with cut corners and a rank-colour border, like the page's own buttons.
const PLATE: Point[] = [
  [26.4, 40.4],
  [39.8, 40.4],
  [39.8, 48.4],
  [37.6, 50.6],
  [24.2, 50.6],
  [24.2, 42.6],
]
/** The numeral in straight bars and a V, like the figures: no font needed. */
function numeral(text: string, cx: number, top: number, h: number) {
  const bw = h * 0.22
  const gap = h * 0.16
  const vw = h * 0.74
  const width = [...text].reduce((w, c) => w + (c === 'V' ? vw : bw), 0) + gap * (text.length - 1)
  const bottom = top + h
  let x = cx - width / 2
  let s = ''
  for (const c of text) {
    if (c === 'I') {
      s += rect(x, top, x + bw, bottom)
      x += bw + gap
    } else {
      const t = bw * 1.08
      const xc = x + vw / 2
      s += poly(
        [
          [x, top],
          [x + t, top],
          [xc, bottom - t * 1.55],
          [x + vw - t, top],
          [x + vw, top],
          [xc + t * 0.55, bottom],
          [xc - t * 0.55, bottom],
        ],
        FILL,
      )
      x += vw + gap
    }
  }
  return s
}
const plate = (division: number, ink: string) =>
  poly(PLATE, 'fill="' + ink + '" stroke="currentColor" stroke-width="1.1"') +
  numeral(romanFor(division), 32, 42.6, 5.8)

export const rankByTier = (tier: number): Rank => (tier < 0 ? UNRATED : RANKS[tier])

export interface EmblemOptions {
  /** Prefix for the gradient and filter ids; must be unique on the page. */
  id: string
  /** Colour of cut-outs and of the Legendary inversion; the page navy by default. */
  ink?: string
  /** The division within the rank, 1 (lowest) to 3, from `divisionFor`; 0 or absent draws none. */
  division?: number
}

/** Default accessible name: rank, division and star count. */
export function emblemLabel(tier: number, division = 0) {
  const n = starsFor(tier)
  const roman = tier >= 0 ? romanFor(division) : ''
  return (
    rankByTier(tier).name +
    (roman ? ' ' + roman : '') +
    ' rank emblem' +
    (n ? ', ' + n + ' star' + (n === 1 ? '' : 's') : '')
  )
}

/** Everything inside the `<svg>` element, for a renderer that writes its own wrapper. */
export function emblemInner(tier: number, { id, ink = NAVY, division = 0 }: EmblemOptions) {
  const rank = rankByTier(tier)
  const t = rank.tier
  const glow = t >= 7

  let defs =
    '<linearGradient id="' +
    id +
    'g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="currentColor" stop-opacity="0.4"/><stop offset="1" stop-color="currentColor" stop-opacity="0.06"/></linearGradient>'
  if (glow)
    defs +=
      '<filter id="' +
      id +
      'f" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="0" stdDeviation="2" flood-color="' +
      rank.color +
      '" flood-opacity="0.4"/></filter>'

  let s = '<g transform="translate(32 ' + CY + ') scale(' + SCALE + ') translate(-32 -32)">'
  if (t < 0) {
    s +=
      poly(HEX, stroke(2.2, 'stroke-dasharray="4 3"')) +
      '<path d="M25 32 H39" stroke="currentColor" stroke-width="3.5"/>'
  } else {
    const legend = t === 9
    if (legend) s += rays(12, 32, 32, 22, 31, 4, 0.4, 15)
    if (t === 6 || t >= 8) s += OUTER_RING
    if (t >= 7) s += WINGS
    if (t >= 4) s += PLATES
    if (t >= 5) s += CAP
    s += poly(HEX, 'fill="' + (legend ? 'currentColor' : ink) + '"')
    if (!legend)
      s += poly(HEX, 'fill="url(#' + id + 'g)" stroke="currentColor" stroke-width="2.2" stroke-linejoin="miter"')
    s += poly(
      HEX_IN,
      'fill="none" stroke="' + (legend ? ink : 'currentColor') + '" stroke-opacity="0.4" stroke-width="1"',
    )
    const figure = FIGURE[t](legend ? rank.color : ink)
    s += legend ? '<g style="color:' + ink + '">' + figure + '</g>' : figure
  }
  s += '</g>' + stars(starsFor(t), ink)

  return (
    '<defs>' +
    defs +
    '</defs>' +
    (glow ? '<g filter="url(#' + id + 'f)">' + s + '</g>' : s) +
    (t >= 0 && division ? plate(division, ink) : '')
  )
}

/** A complete, standalone `<svg>` document for the rank. */
export function emblemSVG(tier: number, options: EmblemOptions & { size?: number; title?: string }) {
  const { size = 64, title } = options
  const label = title || emblemLabel(tier, options.division)
  return (
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="' +
    size +
    '" height="' +
    size +
    '" role="img" aria-label="' +
    label +
    '" style="color:' +
    rankByTier(tier).color +
    '">' +
    '<title>' +
    label +
    '</title>' +
    emblemInner(tier, options) +
    '</svg>'
  )
}

export const emblemForRating = (rating: number | null) => rankFor(rating).tier
