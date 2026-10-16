# Design system

How CF/TRACKER looks and why. Read this before adding or changing UI, so new pieces match the
rest of the page.

The look is inspired by competitive game trackers and Riot's Valorant client, but **nothing is
copied**: no Riot or Valorant logos, agent art, map images or proprietary fonts (Tungsten,
DIN Next). Everything here is original or from Google Fonts.

To see it rather than read it, open [`docs/design/visual-sample.html`](design/visual-sample.html)
in a browser. It is the approved sample: palette with contrast ratios, type, controls, emblems, and
the profile page mocked with example data. Two things changed after it: the match history rows no
longer carry a texture per contest kind on their right edge (the kind is already in the contest's
name), and the emblems are about 30 % larger than drawn there.

## Colour

All colours are tokens, defined once in `src/index.css` (`@theme`). The page is dark-only.

| Token       | Value             | Use                                         | Contrast                                 |
| ----------- | ----------------- | ------------------------------------------- | ---------------------------------------- |
| `bg`        | `#0F1923`         | Page background                             | —                                        |
| `surface`   | `#16232F`         | Panels, rows                                | —                                        |
| `surface-2` | `#1D2C3A`         | Inputs, stat cards, hover                   | —                                        |
| `line`      | `#ECE8E1` at 12 % | 1 px borders, corner ticks                  | —                                        |
| `ink`       | `#ECE8E1`         | Main text                                   | 14.5:1 on `bg`, 11.7:1 on `surface-2`    |
| `ink-muted` | `#9AA5B1`         | Secondary text                              | 7.1:1 on `bg`, 5.7:1 on `surface-2`      |
| `accent`    | `#FF4655`         | Primary actions, accent bars, rating losses | 5.3:1 on `bg`, 4.8:1 on `surface`        |
| `on-accent` | `#0F1923`         | Text on red buttons                         | 5.3:1 on `accent`                        |
| `win`       | `#4FE0B6`         | Rating gained                               | 9.6:1 on `surface`                       |
| `neutral`   | `#8B97A3`         | No change, unrated, pending                 | 5.4:1 on `surface`, 4.8:1 on `surface-2` |

Rules:

- **Red buttons use navy text.** White on `#FF4655` is only 3.4:1 and fails WCAG AA.
- **Red means action or loss.** Never use it for decoration or for "a lot of activity".
- **Text is at least 4.5:1** against whatever it sits on. A Vitest test reads the tokens from
  `index.css` and checks the pairs above, so a token change that breaks contrast fails CI.

### Rank colours

Codeforces' own hues, lifted to read on a dark background. They are the ranks' identity and never
change.

| Rank                                        | From             | Colour    |
| ------------------------------------------- | ---------------- | --------- |
| Newbie                                      | —                | `#A3A3A3` |
| Pupil                                       | 1200             | `#4ADE80` |
| Specialist                                  | 1400             | `#2DD4BF` |
| Expert                                      | 1600             | `#60A5FA` |
| Candidate Master                            | 1900             | `#E879F9` |
| Master, International Master                | 2100, 2300       | `#FB923C` |
| Grandmaster, International GM, Legendary GM | 2400, 2600, 3000 | `#F87171` |

In Legendary Grandmaster the first letter of the handle takes `ink`, as on Codeforces. A user
with no rated contest is **Unrated** (`neutral`), never Newbie.

### Chart colours

Validated with the `dataviz` palette validator against `surface`.

- **Activity heatmap.** One teal hue, 5 levels for 0, 1, 2–3, 4–6 and 7+ submissions:
  `#1D2C3A`, `#1F634F`, `#2B8D71`, `#36BA96`, `#4FE0B6`. Lightness rises at every step, and the
  dimmest step is 2.25:1 on panels.
- **Languages.** Six categorical slots in this fixed order: `#3987E5`, `#D95926`, `#199E70`,
  `#C98500`, `#D55181`, `#9085E9`. Adjacent pairs pass the colour-blindness check, and all are
  at least 3:1 on panels. "Other" is `#5C6875`. Every slice is labelled.
- **Difficulty bars.** Each bar wears the rank colour of its difficulty, as Codeforces colours
  problems. The axis labels carry the value, so colour is never the only cue.
- **Rating chart.** The line is `ink`, the one colour that stays clear of every rank band behind
  it.
- **Comparison chart.** The first player is blue `#3987E5` with a solid line, the second orange
  `#D95926` with a dashed line: the first two language slots, which pass every check as a pair,
  even with all pairs compared. A legend and a label at the end of each line name them, so neither
  colour nor dash is the only cue. `ink` with `accent` was rejected: `ink` fails the lightness and
  chroma checks for a series colour. Lines join contest to contest, as on Codeforces, and run on
  flat from each player's last contest to today, since a rating holds until the next one. Someone
  who stopped competing still has a line to compare against. Small diamonds in each player's
  colour mark their contests. The cursor snaps to a contest of either player and lights up only
  the diamond that is there, so a marker never floats off a line. The other player's rating at
  that moment is in the tooltip, muted, as "Held since" their last contest.

## Type

All from Google Fonts with `display=swap`.

| Face                         | Use                                                                                    |
| ---------------------------- | -------------------------------------------------------------------------------------- |
| **Anton**                    | Wordmark, section titles, big standalone numbers (current rating, deltas, stat values) |
| **Barlow Condensed** 500–700 | Labels, buttons, chips, table headers, uppercase with `letter-spacing: 0.12–0.18em`    |
| **Barlow** 400–600           | Running text                                                                           |

- **Handles are never uppercased.** Codeforces handles are case-sensitive (`Benq`, `jiangly`),
  which is why Anton (it has lowercase) was chosen over Bebas Neue.
- **Anton has no tabular figures.** Use it only for numbers that stand alone. Numbers that line up
  in columns use Barlow or Barlow Condensed with `font-variant-numeric: tabular-nums`; both
  support it.
- **The minus sign is typographic** (`−`, U+2212) in every delta.

## Shapes and texture

- **Cut corners.** Top-left and bottom-right corners are cut at 45° with `clip-path`. The cut is
  painted on two pseudo-element layers, `::before` for the 1 px line and `::after` for the fill,
  never on the element itself. That way the element's focus outline is never clipped.
- **Corner ticks.** 14 px L-shaped marks in `line`, drawn with background gradients.
- **Stripes.** A `repeating-linear-gradient(-45deg, …)` at 3.5 % opacity behind hero areas and
  headers.
- **Accent bars.** A 3–4 px red bar to the left of section titles.
- **Labels.** Always uppercase Barlow Condensed with wide letter spacing.

## Motion

All motion is CSS; there is no animation library.

- Transitions take 120–180 ms with easing `cubic-bezier(0.2, 0, 0, 1)` (`--ease-snap`).
- Panels enter with a 180 ms fade and an 8 px rise (`animate-enter`).
- `prefers-reduced-motion` turns every transition and animation off, through one rule in
  `index.css`.
- No layout animations on long lists, such as the match history.
- The loading indicator is a diagonal scanning bar (`animate-scan`), which stays still with reduced
  motion.

## Match history rows

A row says its result **three ways**, so it never relies on colour alone:

1. A tinted background and a 4 px bar on the left: `win` for a gain, `accent` for a loss,
   `neutral` for no change, unrated or pending.
2. The signed delta in Anton (`+62`, `−33`, `0`, or `—` while pending).
3. A Rated / Unrated / Pending label with an icon.

On desktop the row is a single line: date and duration, the emblem held going in, the contest
name, problem chips, failed attempts and place, rating before → after, the delta, and a link.
Under 640 px it folds into three lines and keeps every field. Solved problems are filled chips;
problems tried and missed are struck through, with the attempts in a tooltip and in screen-reader
text.

## Rank emblems

Codeforces has no rank artwork, so CF/TRACKER draws its own. **The source of truth is
[`docs/design/rank-emblems.js`](design/rank-emblems.js).** It is plain JavaScript that returns an
SVG string for any rank, runs in the browser and in Node, and has no dependencies.

- [`docs/design/rank-emblems.html`](design/rank-emblems.html) shows the whole set at every size,
  with a button that copies each SVG.
- [`docs/design/emblems/`](design/emblems/) holds one standalone `.svg` per rank. Regenerate the
  files with `node docs/design/export-emblems.cjs [size]` after any change.

When the app is built, the same geometry becomes the `RankEmblem` React component; this file
stays the reference.

### Anatomy

Every emblem is a 64 × 64 SVG with three parts:

1. **Frame.** A hexagon with a darker inner hexagon. It gains parts as the rank rises.
2. **Figure.** A chess piece inside the hex. Codeforces rank names come from chess titles, so
   the figure tells the same story: a pawn promoted up to the king.
3. **Stars.** 1 to 7 faceted stars on a ring concentric with the hex, **one per rank colour**.
   Ranks that share a colour share a star count, and the frame tells them apart.

| Tier | Rank                      | Frame                     | Figure                                   | Stars |
| ---- | ------------------------- | ------------------------- | ---------------------------------------- | ----- |
| —    | Unrated                   | Dashed hex                | A dash                                   | 0     |
| 0    | Newbie                    | Plain hex                 | Pawn                                     | 1     |
| 1    | Pupil                     | Plain hex                 | Knight (stepped mane)                    | 2     |
| 2    | Specialist                | Plain hex                 | Bishop                                   | 3     |
| 3    | Expert                    | Plain hex                 | Rook                                     | 4     |
| 4    | Candidate Master          | + side plates             | Queen (coronet and orb)                  | 5     |
| 5    | Master                    | + top cap                 | King (crown and cross)                   | 6     |
| 6    | International Master      | + outer ring              | King                                     | 6     |
| 7    | Grandmaster               | + wings and glow, no ring | King, crown with two points              | 7     |
| 8    | International Grandmaster | + outer ring              | King, five-point crown, jewel and mantle | 7     |
| 9    | Legendary Grandmaster     | Filled hex, halo, ring    | King, imperial crown                     | 7     |

### Rules for the figures

All figures are flat blocks (trapezoids, bars, diamonds and octagons), with no curves.

- **One base.** Every piece stands on the same slab.
- **One taper.** The body narrows upward to a rectangular collar. The queen and king share
  everything below the head: base, body, two collars and a neck.
- **Only the head names the piece.** An octagon for the pawn, a horse with a mane, a mitre with a
  slit and a diamond ball, battlements, a coronet with a diamond orb, and a flared crown with a
  band and a cross.
- **Heights follow a real set.** The pawn is the shortest. The rook is short and wide. The king is
  the tallest.
- **The red kings keep the king's body.** Only the crown changes, and the cross stays.
- **Details are cut-outs.** The knight's eye, the bishop's slit and the crown's band are drawn in
  the page navy (the `ink` option), like holes in the shape.

### Using the emblems

- **Sizes.** 140 px in the profile header, up to 100 px on the home page's rank ladder (the
  emblem fills its cell), 92 px on the rating card, 84 px in the match history (64 px in rows on
  phones), 80 px in the comparison header.
  Stars are countable from 44 px up; at 28 px they read as a row of dots.
- **Accessibility.** Every emblem has `role="img"`, an `aria-label` and a `<title>` with the rank
  name and star count. Next to text, the rank name is always written out too.
- **The emblem in a history row is the rank held going into the contest.** It comes from the
  rating before the contest, not the rating after it.

## Accessibility checklist

- Every control works from the keyboard, and focus is always visible (2 px `ink` outline, 3 px
  offset).
- Text contrast is at least 4.5:1. Chart marks are at least 3:1, or have visible labels.
- No information depends on colour alone. Deltas carry a sign, results carry a label, problem
  chips are struck through when missed.
- Tooltips add to what is on screen and are never the only way to read a value. Charts also have
  keyboard access and a live region.
- `prefers-reduced-motion` is respected everywhere.
