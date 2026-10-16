import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { contrast, luminance } from '../lib/contrast'

// Read from disk: Vitest skips CSS imports, `?raw` included.
const css = readFileSync(new URL('../index.css', import.meta.url), 'utf8')

/** The `--color-*` tokens written as plain hex in index.css. */
const tokens = Object.fromEntries(
  [...css.matchAll(/--color-([\w-]+):\s*(#[0-9a-f]{6})\s*;/gi)].map(([, name, hex]) => [name, hex.toLowerCase()]),
)
const token = (name: string) => {
  const value = tokens[name]
  if (!value) throw new Error(`--color-${name} is missing or not a #rrggbb value`)
  return value
}

describe('design tokens', () => {
  it.each([
    ['ink', 'bg'],
    ['ink', 'surface'],
    ['ink', 'surface-2'],
    ['ink-muted', 'bg'],
    ['ink-muted', 'surface'],
    ['ink-muted', 'surface-2'],
    ['accent', 'bg'],
    ['accent', 'surface'],
    ['on-accent', 'accent'],
    ['win', 'surface'],
    ['loss', 'surface'],
    ['neutral', 'surface'],
    ['neutral', 'surface-2'],
  ])('%s text on %s is at least 4.5:1', (text, background) => {
    expect(contrast(token(text), token(background))).toBeGreaterThanOrEqual(4.5)
  })

  it('keeps the heatmap ramp getting lighter at every level', () => {
    const ramp = [0, 1, 2, 3, 4].map((level) => luminance(token(`heat-${level}`)))
    ramp.slice(1).forEach((value, i) => expect(value).toBeGreaterThan(ramp[i]))
  })

  it('keeps the dimmest active heatmap level visible on panels', () => {
    expect(contrast(token('heat-1'), token('surface'))).toBeGreaterThanOrEqual(2)
  })

  it('keeps every language colour at least 3:1 on panels', () => {
    for (const slot of [1, 2, 3, 4, 5, 6]) {
      expect(contrast(token(`lang-${slot}`), token('surface'))).toBeGreaterThanOrEqual(3)
    }
  })
})
