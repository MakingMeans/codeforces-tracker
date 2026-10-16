/** The kind of round, read from its name; picks the pattern at the end of a history row. */
export type ContestKind = 'div1' | 'div2' | 'div3' | 'div4' | 'edu' | 'global' | 'other'

const DIV = (n: number) => new RegExp(`div\\.?\\s*${n}\\b`)

export function contestKind(name: string): ContestKind {
  const text = name.toLowerCase()
  if (text.includes('educational')) return 'edu'
  if (text.includes('global round')) return 'global'
  // "Div. 1 + Div. 2" rounds are drawn as Div. 1.
  if (DIV(1).test(text)) return 'div1'
  if (DIV(4).test(text)) return 'div4'
  if (DIV(3).test(text)) return 'div3'
  if (DIV(2).test(text)) return 'div2'
  return 'other'
}

export const CONTEST_KIND_LABEL: Record<ContestKind, string> = {
  div1: 'Div. 1',
  div2: 'Div. 2',
  div3: 'Div. 3',
  div4: 'Div. 4',
  edu: 'Educational',
  global: 'Global',
  other: 'Other',
}
