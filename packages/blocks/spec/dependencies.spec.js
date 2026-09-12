import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

// MermaidPlugin sanitizes mermaid's SVG output with dompurify before assigning
// it to innerHTML, and @rokkit/blocks is published, so this range reaches every
// consumer the same way @rokkit/ui's does. See packages/ui/spec/dependencies.spec.js
// for why 3.4.13 is the floor.
const MIN_DOMPURIFY = [3, 4, 13]

const PKG_DIR = join(process.cwd(), 'packages/blocks')
const pkg = JSON.parse(readFileSync(join(PKG_DIR, 'package.json'), 'utf-8'))

/**
 * @param {string} range - a range such as `^3.4.13`
 * @returns {Array<number>} [major, minor, patch]
 */
function floorOf(range) {
	return range.replace(/^[\^~>=]+/, '').split('.').map(Number)
}

/**
 * @param {Array<number>} a
 * @param {Array<number>} b
 * @returns {number} negative when a < b, 0 when equal, positive when a > b
 */
function compare(a, b) {
	return a[0] - b[0] || a[1] - b[1] || a[2] - b[2]
}

describe('@rokkit/blocks — dependency floors', () => {
	it('declares a dompurify floor that excludes every known advisory', () => {
		const range = pkg.dependencies.dompurify

		expect(compare(floorOf(range), MIN_DOMPURIFY), `declared ${range}`).toBeGreaterThanOrEqual(0)
	})
})
