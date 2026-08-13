import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

// Guards the package.json `exports` map: every subpath must resolve to a file
// that actually exists, and the documented icon collections must be exported.
// Vitest runs from the repo root; the jsdom env sets import.meta.url to a
// non-file: URL, so resolve against cwd rather than the module URL.
const PKG_DIR = join(process.cwd(), 'packages/icons')
const pkg = JSON.parse(readFileSync(join(PKG_DIR, 'package.json'), 'utf-8'))

describe('@rokkit/icons — exports map', () => {
	it('every exported subpath points at a file that exists', () => {
		for (const [subpath, target] of Object.entries(pkg.exports)) {
			expect(existsSync(join(PKG_DIR, target)), `${subpath} → ${target}`).toBe(true)
		}
	})

	it('exports the light and solid icon collections (documented in llms icons.txt)', () => {
		expect(pkg.exports['./light.json']).toBe('./lib/light.json')
		expect(pkg.exports['./solid.json']).toBe('./lib/solid.json')
	})

	it('does not export a broken ./utils subpath', () => {
		// `./utils` used to point at ./src/convert.js, which does not exist in this
		// package (the real converter lives in @rokkit/cli).
		expect(pkg.exports['./utils']).toBeUndefined()
	})
})
