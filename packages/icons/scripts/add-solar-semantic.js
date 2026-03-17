// packages/icons/scripts/add-solar-semantic.js
// Generates semantic icon SVGs (4 variants each) from Solar icons.
// Uses the same variant convention as glyph icons.
import solar from '@iconify-json/solar/icons.json' with { type: 'json' }
import { writeFileSync, mkdirSync } from 'fs'
import { resolve } from 'path'
import semanticMap from './semantic-map.json' with { type: 'json' }

const OUT = resolve('src/semantic')
mkdirSync(OUT, { recursive: true })

// Same variant mapping as glyph icons
const VARIANTS = [
	{ solarSuffix: '-bold-duotone', ourSuffix: '' },
	{ solarSuffix: '-linear',       ourSuffix: '-outline' },
	{ solarSuffix: '-bold',         ourSuffix: '-solid' },
	{ solarSuffix: '-line-duotone', ourSuffix: '-duotone-outline' }
]

function iconToSVG(body) {
	return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">\n${body}\n</svg>`
}

let written = 0
let missing = 0

for (const entry of semanticMap) {
	for (const variant of VARIANTS) {
		const solarKey = entry.solar + variant.solarSuffix
		const icon = solar.icons[solarKey]
		if (!icon) {
			console.warn(`MISSING: solar:${solarKey} (semantic: ${entry.name})`)
			missing++
			continue
		}
		const filename = `${entry.name + variant.ourSuffix}.svg`
		writeFileSync(`${OUT}/${filename}`, iconToSVG(icon.body))
		written++
	}
}

console.log(`\nDone: ${written} written, ${missing} missing solar icons.`)
