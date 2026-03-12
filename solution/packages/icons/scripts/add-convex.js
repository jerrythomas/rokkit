import { processFile } from './normalize.js'
import { resolve } from 'path'

const SRC = '/Users/Jerry/Downloads/Logos/SVG'
const OUT = resolve('src/auth')

const files = [
	{ in: `${SRC}/symbol-color.svg`, out: `${OUT}/convex.svg`, h: 24, w: 24 },
	{ in: `${SRC}/symbol-white.svg`, out: `${OUT}/convex-white.svg`, h: 24, w: 24 },
	{ in: `${SRC}/symbol-black.svg`, out: `${OUT}/convex-black.svg`, h: 24, w: 24 },
	{ in: `${SRC}/logo-color.svg`, out: `${OUT}/convex-logo.svg`, h: 24, w: null },
	{ in: `${SRC}/logo-white.svg`, out: `${OUT}/convex-logo-white.svg`, h: 24, w: null },
	{ in: `${SRC}/logo-black.svg`, out: `${OUT}/convex-logo-black.svg`, h: 24, w: null },
	{ in: `${SRC}/wordmark-black.svg`, out: `${OUT}/convex-wordmark.svg`, h: 24, w: null },
	{ in: `${SRC}/wordmark-white.svg`, out: `${OUT}/convex-wordmark-white.svg`, h: 24, w: null }
]

for (const f of files) {
	processFile(f.in, f.out, { targetH: f.h, targetW: f.w })
}
console.log('Convex icons written.')
