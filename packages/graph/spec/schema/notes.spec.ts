import { describe, it, expect } from 'vitest'
import { inlineSegs, noteBlocks } from '../../src/schema/notes.js'

describe('inlineSegs', () => {
	it('returns a single plain segment for text with no code', () => {
		expect(inlineSegs('hello')).toEqual([{ code: false, text: 'hello' }])
	})

	it('splits a backtick span into a code segment', () => {
		expect(inlineSegs('use `id` here')).toEqual([
			{ code: false, text: 'use ' },
			{ code: true, text: 'id' },
			{ code: false, text: ' here' }
		])
	})

	it('handles a code span at the start', () => {
		expect(inlineSegs('`id` first')).toEqual([
			{ code: true, text: 'id' },
			{ code: false, text: ' first' }
		])
	})

	it('handles two code spans', () => {
		expect(inlineSegs('`a` and `b`')).toEqual([
			{ code: true, text: 'a' },
			{ code: false, text: ' and ' },
			{ code: true, text: 'b' }
		])
	})

	it('returns an empty list for an empty string', () => {
		expect(inlineSegs('')).toEqual([])
	})

	it('leaves an unterminated backtick as plain text', () => {
		expect(inlineSegs('use `id here')).toEqual([{ code: false, text: 'use `id here' }])
	})

	it('treats markup as literal text — it parses code spans, not HTML', () => {
		// The input is a DDL comment, so it can contain anything. This parser deliberately
		// understands only backticks and bullets: no tag is ever recognised, so the segment
		// text carries the markup verbatim and Svelte's text interpolation escapes it at
		// render time. That is why the package needs neither a markdown lib nor a sanitiser.
		expect(inlineSegs('<script>alert(1)</script>')).toEqual([
			{ code: false, text: '<script>alert(1)</script>' }
		])
	})
})

describe('noteBlocks', () => {
	it('returns an empty list for undefined', () => {
		expect(noteBlocks(undefined)).toEqual([])
	})

	it('returns an empty list for an empty string', () => {
		expect(noteBlocks('')).toEqual([])
	})

	it('joins consecutive lines into one paragraph', () => {
		expect(noteBlocks('one\ntwo')).toEqual([
			{ type: 'p', lines: [[{ code: false, text: 'one two' }]] }
		])
	})

	it('splits paragraphs on a blank line', () => {
		const blocks = noteBlocks('one\n\ntwo')

		expect(blocks).toHaveLength(2)
		expect(blocks.every((b) => b.type === 'p')).toBe(true)
	})

	it('collects dash bullets into one list block', () => {
		expect(noteBlocks('- a\n- b')).toEqual([
			{ type: 'ul', lines: [[{ code: false, text: 'a' }], [{ code: false, text: 'b' }]] }
		])
	})

	it('accepts a bullet character as well as a dash', () => {
		expect(noteBlocks('• a')[0].type).toBe('ul')
	})

	it('keeps a paragraph and a following list as separate blocks', () => {
		const blocks = noteBlocks('intro\n- a')

		expect(blocks.map((b) => b.type)).toEqual(['p', 'ul'])
	})

	it('keeps a list and a following paragraph as separate blocks', () => {
		expect(noteBlocks('- a\noutro').map((b) => b.type)).toEqual(['ul', 'p'])
	})

	it('parses inline code inside a bullet', () => {
		expect(noteBlocks('- use `id`')[0].lines[0]).toEqual([
			{ code: false, text: 'use ' },
			{ code: true, text: 'id' }
		])
	})

	it('ignores leading and trailing blank lines', () => {
		expect(noteBlocks('\n\nonly\n\n')).toHaveLength(1)
	})

	it('treats a whitespace-only string as empty', () => {
		expect(noteBlocks('   \n\t\n')).toEqual([])
	})
})
