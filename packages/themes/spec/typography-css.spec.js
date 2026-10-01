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

/* `[data-heading='1'..'4']` is the heading hook: a card title or a dialog title takes a level by
 * attribute, and prose headings (`[data-prose] h1`…) take the same rule. Defaults are the guides'
 * own scale, so adopting them changed nothing on screen. Typography, not colour — base may hold it. */
describe('base heading levels', () => {
	const css = read('base/heading.css')
	const ruleFor = (level) => {
		const match = css.match(new RegExp(`\\[data-heading='${level}'\\][^{]*\\{([^}]*)\\}`))
		return match?.[1] ?? ''
	}

	it('is imported by base', () => {
		expect(read('base/index.css')).toContain('heading.css')
	})

	it.each([
		['1', '28px', '700', '1.2'],
		['2', '18px', '600', '1.3'],
		['3', '14.5px', '600', 'normal'],
		['4', '14px', '600', '1.4']
	])('level %s is %s / %s / %s, in the display face', (level, size, weight, leading) => {
		const rule = ruleFor(level)
		expect(rule).toMatch(new RegExp(`font-size:\\s*${size.replace('.', '\\.')}`))
		expect(rule).toMatch(new RegExp(`font-weight:\\s*${weight}`))
		expect(rule).toMatch(new RegExp(`line-height:\\s*${leading.replace('.', '\\.')}`))
		expect(rule).toMatch(/font-family:\s*var\(--font-display\)/)
	})

	it('styles prose headings with the same rule', () => {
		for (const level of ['1', '2', '3', '4']) expect(css).toMatch(new RegExp(`\\[data-prose\\] h${level}`))
	})

	it('carries no colour — base is headless', () => {
		expect(css).not.toMatch(/(^|[^-])color\s*:|background/)
	})
})
