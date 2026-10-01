/* #152 — headings are styled through `[data-heading]` rules, so base declares no one-property
 * type-scale tokens: a level is size + weight + line-height + tracking at once. */
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const read = (p) => readFileSync(join(process.cwd(), 'packages/themes/src', p), 'utf-8')

describe('base typography', () => {
	it('declares no type-scale tokens', () => {
		const css = read('base/typography.css')
		expect(css).not.toMatch(/--(text|leading|weight)-(h[1-6]|body|small)\s*:/)
	})
})
