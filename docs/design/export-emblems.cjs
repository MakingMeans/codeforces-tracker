// Writes one standalone .svg per rank into docs/design/emblems/, and with
// --divisions one per rank and division as well (pupil-2.svg …).
// Usage: node docs/design/export-emblems.cjs [size] [--divisions]
const fs = require('node:fs')
const path = require('node:path')
const { RANKS, UNRATED, DIVISIONS, emblemSVG } = require('./rank-emblems.js')

const size = Number(process.argv.slice(2).find((arg) => !arg.startsWith('--'))) || 128
const withDivisions = process.argv.includes('--divisions')
const outDir = path.join(__dirname, 'emblems')
fs.mkdirSync(outDir, { recursive: true })

for (const rank of [...RANKS, UNRATED]) {
  const slug = rank.name.toLowerCase().replace(/\s+/g, '-')
  fs.writeFileSync(path.join(outDir, `${slug}.svg`), emblemSVG(rank.tier, { size }) + '\n')
  console.log(`${slug}.svg`)
  if (!withDivisions || rank.tier < 0) continue
  for (let division = 1; division <= DIVISIONS[rank.tier].starts.length; division++) {
    fs.writeFileSync(path.join(outDir, `${slug}-${division}.svg`), emblemSVG(rank.tier, { size, division }) + '\n')
    console.log(`${slug}-${division}.svg`)
  }
}
