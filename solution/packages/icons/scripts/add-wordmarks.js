import { normalizeSVG, monochromeVariant } from './normalize.js'
import { writeFileSync } from 'fs'
import { resolve } from 'path'

const OUT = resolve('src/auth')

export function writeWordmarkPair(name, svg) {
	const normalized = normalizeSVG(svg, 24, null)
	writeFileSync(`${OUT}/${name}-wordmark.svg`, normalized)
	const white = monochromeVariant(normalized, '#ffffff')
	writeFileSync(`${OUT}/${name}-wordmark-white.svg`, white)
	console.log(`Wordmark written: ${name}`)
}
