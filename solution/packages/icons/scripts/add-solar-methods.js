import solar from '@iconify-json/solar/icons.json' with { type: 'json' }
import { writeFileSync } from 'fs'
import { resolve } from 'path'

const OUT = resolve('src/auth')

const METHODS = [
	{ name: 'email', solarBase: 'letter' },
	{ name: 'phone', solarBase: 'phone' },
	{ name: 'password', solarBase: 'lock-password' },
	{ name: 'magic', solarBase: 'magic-stick-2' },
	{ name: 'passkey', solarBase: 'key' },
	{ name: 'mfa', solarBase: 'shield' }
]

const VARIANTS = [
	{ solarSuffix: '-bold', ourSuffix: '' },
	{ solarSuffix: '-linear', ourSuffix: '-outline' },
	{ solarSuffix: '-bold-duotone', ourSuffix: '-duotone' },
	{ solarSuffix: '-broken', ourSuffix: '-duotone-outline' }
]

function iconToSVG(body) {
	return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">\n${body}\n</svg>`
}

for (const method of METHODS) {
	for (const variant of VARIANTS) {
		const solarKey = method.solarBase + variant.solarSuffix
		const icon = solar.icons[solarKey]
		if (!icon) {
			console.warn(`MISSING: solar:${solarKey}`)
			continue
		}
		const filename = `${method.name + variant.ourSuffix  }.svg`
		writeFileSync(`${OUT}/${filename}`, iconToSVG(icon.body))
		console.log(`Written: ${filename}`)
	}
}
console.log('Solar auth method icons complete.')
