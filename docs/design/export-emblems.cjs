// Writes one standalone .svg per rank into docs/design/emblems/.
// Usage: node docs/design/export-emblems.cjs [size]
const fs = require('node:fs')
const path = require('node:path')
const { RANKS, UNRATED, emblemSVG } = require('./rank-emblems.js')

const size = Number(process.argv[2]) || 128
const outDir = path.join(__dirname, 'emblems')
fs.mkdirSync(outDir, { recursive: true })

for (const rank of [...RANKS, UNRATED]) {
  const slug = rank.name.toLowerCase().replace(/\s+/g, '-')
  fs.writeFileSync(path.join(outDir, `${slug}.svg`), emblemSVG(rank.tier, { size }) + '\n')
  console.log(`${slug}.svg`)
}
