import * as si from 'simple-icons'
import { writeFileSync } from 'fs'
import { resolve } from 'path'

const OUT = resolve('src/auth')

// Note: Microsoft, Microsoftazure, Awsamplify, Amazoncognito are NOT available in simple-icons v16
// Those will need to be handled separately (existing azure.svg, microsoft.svg remain as-is)
const BRANDS = [
	{ name: 'github', slug: 'Github' },
	{ name: 'google', slug: 'Google' },
	{ name: 'apple', slug: 'Apple' },
	{ name: 'twitter', slug: 'X', hex: '000000' },
	{ name: 'facebook', slug: 'Facebook' },
	{ name: 'auth0', slug: 'Auth0' },
	{ name: 'clerk', slug: 'Clerk' },
	{ name: 'okta', slug: 'Okta' },
	{ name: 'appwrite', slug: 'Appwrite' },
	{ name: 'firebase', slug: 'Firebase' },
	{ name: 'pocketbase', slug: 'Pocketbase' },
	{ name: 'keycloak', slug: 'Keycloak' },
	{ name: 'supabase', slug: 'Supabase' },
	{ name: 'nextauth', slug: 'Nextdotjs', hex: '000000' }
]

function makeSVG(path, fill) {
	return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">\n<path d="${path}" fill="${fill}"/>\n</svg>`
}

let written = 0
let skipped = 0

for (const brand of BRANDS) {
	const icon = si[`si${brand.slug}`]
	if (!icon) {
		console.warn(`NOT FOUND: ${brand.name} (si${brand.slug})`)
		skipped++
		continue
	}
	const hex = brand.hex ?? icon.hex
	const brandColor = `#${hex}`
	writeFileSync(`${OUT}/${brand.name}.svg`, makeSVG(icon.path, brandColor))
	writeFileSync(`${OUT}/${brand.name}-white.svg`, makeSVG(icon.path, '#ffffff'))
	writeFileSync(`${OUT}/${brand.name}-black.svg`, makeSVG(icon.path, '#141414'))
	console.log(`Written: ${brand.name} (${brandColor})`)
	written++
}

console.log(
	`\nBrand icons complete. Written: ${written * 3} files (${written} brands × 3 variants). Skipped: ${skipped}`
)
