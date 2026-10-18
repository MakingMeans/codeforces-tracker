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

| Token       | Value             | Use                                         | Contrast                                  |
| ----------- | ----------------- | ------------------------------------------- | ----------------------------------------- |
| `bg`        | `#0F1923`         | Page background                             | —                                         |
| `surface`   | `#16232F`         | Panels, rows                                | —                                         |
| `surface-2` | `#1D2C3A`         | Inputs, stat cards, hover                   | —                                         |
| `line`      | `#ECE8E1` at 12 % | 1 px borders, corner ticks                  | —                                         |
| `ink`       | `#ECE8E1`         | Main text                                   | 14.5:1 on `bg`, 11.7:1 on `surface-2`     |
| `ink-muted` | `#9AA5B1`         | Secondary text                              | 7.1:1 on `bg`, 5.7:1 on `surface-2`       |
| `accent`    | `#FF4655`         | Primary actions, accent bars, rating losses | 5.3:1 on `bg`, 4.8:1 on `surface`         |
| `on-accent` | `#0F1923`         | Text on red buttons                         | 5.3:1 on `accent`                         |
| `win`       | `#4FE0B6`         | Rating gained, up a rank                    | 9.6:1 on `surface`                        |
| `even`      | `#FACC15`         | Rated, but no change                        | 10.4:1 on `surface`, 9.3:1 on `surface-2` |
| `neutral`   | `#8B97A3`         | Unrated, pending                            | 5.4:1 on `surface`, 4.8:1 on `surface-2`  |

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

**A place's average is the one exception.** When the average rating of a country, city or
organization falls in Newbie, its emblem, its "Average rank" line and its Average figure are drawn in
yellow `#FACC15` (`NEWBIE_AVERAGE`, `averageRankFor`), with Newbie's figure and stars unchanged.
Every other rank keeps its colour there too. A player's own Newbie rank stays grey everywhere.

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
- **Text fields are not cut.** Inputs cannot have pseudo-elements, so they get a plain 1 px
  `line-strong` border on `surface-2` instead (`fieldClass`). A field that needs the cut, like the
  big search, is wrapped in a cut box.
- **Corner ticks.** 14 px L-shaped marks in `line`, drawn with background gradients.
- **Stripes.** A `repeating-linear-gradient(-45deg, …)` at 3.5 % opacity behind hero areas and
  headers.
- **Accent bars.** A 3–4 px red bar to the left of section titles.
- **Labels.** Always uppercase Barlow Condensed with wide letter spacing.

## Motion

All motion is CSS; there is no animation library.

- Transitions take 120–180 ms with easing `cubic-bezier(0.2, 0, 0, 1)` (`--ease-snap`).
- Panels enter with a 180 ms fade and an 8 px rise (`animate-enter`).
- The home page comes in once, top to bottom: eyebrow, title, intro, search, chips and the two
  panels, 80 ms apart, each with a 520 ms fade and a 14 px rise (`animate-fade-up`). The rank
  ladder's ranks follow, 45 ms apart, from Newbie up.
- Match history rows lift under the pointer or keyboard focus: `scale(1.012)` and a touch
  brighter, over 160 ms. The row grows in place and its neighbours do not move.
- `prefers-reduced-motion` turns every transition and animation off, delays included, through one
  rule in `index.css`. The row lift is off too.
- No layout animations on long lists, such as the match history.
- The loading indicator is a diagonal scanning bar (`animate-scan`), which stays still with reduced
  motion.

## Navigation

Three sections, the same everywhere: **Players** (search and profiles), **Compare** (picking two
players, and comparisons) and **Rankings**. Compare opened from a profile starts with that player as
the first one.

- **Desktop.** A 76 px rail on the left, under the top bar, that stays in view. Each section is an
  icon over an 11 px uppercase label: icons alone read worse. The current one is in `ink` with a 3 px
  red bar on its left and `aria-current="page"`.
- **Phones** (under 768 px). The same sections as a tab bar fixed to the bottom edge, the current one
  marked by a red bar on top. Pages leave 64 px plus the safe-area inset free at the bottom.
- **Top bar.** The wordmark, the handle search on every page but the home page, and the GitHub link.

## Rankings

- **Search with a scope.** Above the field, chips pick what to find: Player, Country, City or
  Organization. Places are suggested as you type from the rankings snapshot, accents ignored;
  names that start with the text come first, then the biggest. It is a WAI-ARIA combobox: arrow keys
  move through the list, Enter opens, Escape closes.
- **Handle suggestions.** Every handle field (the searches and Compare) suggests
  rated players from the snapshot as you type: handles that start with the text first, then those
  that contain it, best rated first, each with a 32 px emblem, rating and country. An empty field
  offers recent searches. Enter on a highlighted suggestion picks it; otherwise Enter searches what
  was typed, so a handle missing from the snapshot (unrated, or away for a month) still works.
- **Suggestion lists sit on top.** Cut boxes isolate their stacking, so a field with suggestions
  lifts its own container (`relative z-20`, the top bar `z-30`) above what follows on the page.
- **Average rank.** Next to a ranking's title, a 128 px emblem (96 px on phones) of the
  rank and division the average rating falls in, with "Average rank · Newbie III" under the title.
  A Newbie average is yellow (see "Rank colours"); the Countries table's Average column follows it.
- **Stat tiles.** A big Anton number (36 px) over a small label, ratings in their rank colour: players,
  competed this month, average, and **Team rating · top 3**, Codeforces' team formula on the best
  three (the rating of a player the team would beat half the time, the team winning if any member
  wins). Two even columns on phones, a wrapping row from 640 px.
- **Player tables.** Fixed layout, so long handles are cut instead of widening the page. Text at
  17 px; the place in 24 px Anton; the emblem at 84 px with its division; the handle at 18 px in its
  rank colour, linking to the profile; the rating at 18 px semibold in its rank colour, best rating
  muted. Equal ratings share a place (1, 2, 2, 4).
- **Player tables on phones** (under 640 px). The handle gets the room: the place column narrows to
  44 px (20 px Anton), the rating column to 72 px, cells keep 8 px of padding, the emblem is 56 px
  and never shrinks, 10 px from the handle, and handle and rating are 16 px. The best rating and the
  city, organization or country columns are hidden.
- **Changed rank this week.** A player whose rank is not the one they had a week ago (the build
  compares with their rating before the week's contests; divisions do not count) gets a 16 px double
  chevron after the handle, up in `win` or down in `loss`, with "up from Pupil this week" in its
  tooltip and for screen readers. The note under the table explains it.
- **Competed this month.** A 7 px `win` square after the handle, with the words for screen readers.
- **The player you came from.** Arriving from a profile's chip, their row is tinted, outlined in
  `win` with a 4 px bar, and scrolled into view. When they are far down, the list shows its first
  page, a `···` gap, then the rows around them.
- **Profile chips.** Under the location, which links to each ranking: one chip per place
  (`#58 Colombia`, the number in Anton). None show for a player missing from the rankings.

## Match history rows

A row says its result **three ways**, so it never relies on colour alone:

1. A tinted background and a 4 px bar on the left: `win` for a gain, `accent` for a loss,
   `even` (yellow) for a rated contest with no change, `neutral` for unrated or pending.
2. The signed delta in Anton (`+62`, `−33`, `0`, or `—` while pending).
3. A Rated / Unrated / Pending label with an icon, in the colour of the delta.

**A contest that changed the rank** (Newbie to Pupil, Expert to Specialist; divisions do not count,
nor a first contest from unrated) says so next to the place: "Up to Specialist" or "Down to Pupil" in
the label style, with a double chevron, in `win` or `loss`. The row itself looks like any other.

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

Every emblem is a 64 × 64 SVG with four parts:

1. **Frame.** A hexagon with a darker inner hexagon. It gains parts as the rank rises.
2. **Figure.** A chess piece inside the hex. Codeforces rank names come from chess titles, so
   the figure tells the same story: a pawn promoted up to the king.
3. **Stars.** 1 to 7 faceted stars on a ring concentric with the hex, **one per rank colour**.
   Ranks that share a colour share a star count, and the frame tells them apart.
4. **Division.** Where in its rank the rating sits, as a roman numeral on a small plate over the
   hex's bottom corner (see below).

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

### Divisions

Every rank has **three divisions, I, II and III**, I the lowest. The rank's span is cut in
thirds, rounded to tens so the boundaries are easy to remember: a 200-point rank splits 70 / 60 / 70,
a 400-point one 130 / 140 / 130. Newbie's I takes everything below 400, and Legendary
Grandmaster's III has no ceiling.

| Rank                      | Span        | Divisions                                  |
| ------------------------- | ----------- | ------------------------------------------ |
| Newbie                    | below 1200  | I up to 399 · II 400–799 · III 800–1199    |
| Pupil                     | 1200–1399   | I 1200–1269 · II 1270–1329 · III 1330–1399 |
| Specialist                | 1400–1599   | I 1400–1469 · II 1470–1529 · III 1530–1599 |
| Expert                    | 1600–1899   | I 1600–1699 · II 1700–1799 · III 1800–1899 |
| Candidate Master          | 1900–2099   | I 1900–1969 · II 1970–2029 · III 2030–2099 |
| Master                    | 2100–2299   | I 2100–2169 · II 2170–2229 · III 2230–2299 |
| International Master      | 2300–2399   | I 2300–2329 · II 2330–2369 · III 2370–2399 |
| Grandmaster               | 2400–2599   | I 2400–2469 · II 2470–2529 · III 2530–2599 |
| International Grandmaster | 2600–2999   | I 2600–2729 · II 2730–2869 · III 2870–2999 |
| Legendary Grandmaster     | 3000 and up | I 3000–3199 · II 3200–3399 · III 3400+     |

The starts live in `src/lib/codeforces/ranks.ts` (`DIVISIONS`, `divisionFor`) and in
`rank-emblems.js`; a test keeps the two equal.

- **The plate.** Navy, with cut corners and a 1 px border in the rank colour, like the page's
  buttons. It sits over the hex's bottom corner, clear of the figure and of up to seven stars.
- **The numeral.** Drawn in straight bars and a V in the rank colour, like the figures, so it needs
  no font and stays crisp in the exported SVGs.
- **Only on the emblem.** Text next to an emblem keeps the plain rank name ("Pupil"). The
  division is in the emblem's accessible name ("Pupil II rank emblem, 2 stars").
- **Not on the rank ladder.** The home page's ladder shows ranks, not a rating, so its emblems
  carry no plate; each rank lists where its II and III start instead ("II 1270 · III 1330", the
  full ranges in a tooltip and for screen readers), with a line explaining them. Unrated never has one.

### Using the emblems

- **Sizes.** 140 px in the profile header, up to 100 px on the home page's rank ladder (the
  emblem fills its cell), 92 px on the rating card, 84 px in the match history (64 px in rows on
  phones), 80 px in the comparison header, 84 px in ranking tables (56 px on phones), 128 px for a ranking's average rank,
  32 px in handle suggestions.
  Stars are countable from 44 px up; at 28 px they read as a row of dots.
- **Accessibility.** Every emblem has `role="img"`, an `aria-label` and a `<title>` with the rank
  name and star count. Next to text, the rank name is always written out too.
- **The emblem in a history row is the rank held going into the contest.** It and its division
  come from the rating before the contest, not the rating after it.

## Accessibility checklist

- Every control works from the keyboard, and focus is always visible (2 px `ink` outline, 3 px
  offset).
- Text contrast is at least 4.5:1. Chart marks are at least 3:1, or have visible labels.
- No information depends on colour alone. Deltas carry a sign, results carry a label, problem
  chips are struck through when missed.
- Tooltips add to what is on screen and are never the only way to read a value. Charts also have
  keyboard access and a live region.
- `prefers-reduced-motion` is respected everywhere.
