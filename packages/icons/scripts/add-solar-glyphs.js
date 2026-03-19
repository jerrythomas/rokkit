// packages/icons/scripts/add-solar-glyphs.js
import solar from '@iconify-json/solar/icons.json' with { type: 'json' }
import { writeFileSync, mkdirSync } from 'fs'
import { resolve } from 'path'
import glyphMap from './glyph-map.json' with { type: 'json' }

const OUT = resolve('src/glyph')
mkdirSync(OUT, { recursive: true })

// duotone is default (differs from auth icons which use bold as default)
const VARIANTS = [
	{ solarSuffix: '-bold-duotone', ourSuffix: '', skipDefault: true },
	{ solarSuffix: '-linear', ourSuffix: '-outline' },
	{ solarSuffix: '-bold', ourSuffix: '-solid' },
	{ solarSuffix: '-line-duotone', ourSuffix: '-duotone-outline' }
]

function iconToSVG(body) {
	return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">\n${body}\n</svg>`
}

let written = 0
let skipped = 0
let missing = 0

for (const glyph of glyphMap) {
	for (const variant of VARIANTS) {
		if (variant.skipDefault && glyph.skipDefault) {
			skipped++
			continue
		}
		const solarKey = glyph.solar + variant.solarSuffix
		const icon = solar.icons[solarKey]
		if (!icon) {
			console.warn(`MISSING: solar:${solarKey} (glyph: ${glyph.name})`)
			missing++
			continue
		}
		const filename = `${glyph.name + variant.ourSuffix}.svg`
		writeFileSync(`${OUT}/${filename}`, iconToSVG(icon.body))
		console.log(`Written: ${filename}`)
		written++
	}
}

console.log(
	`\nDone: ${written} written, ${skipped} skipped (skipDefault), ${missing} missing solar icons.`
)
