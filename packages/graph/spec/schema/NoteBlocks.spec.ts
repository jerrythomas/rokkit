import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import NoteBlocks from '../../src/schema/NoteBlocks.svelte'

describe('NoteBlocks', () => {
	it('renders nothing for an absent note', () => {
		const { container } = render(NoteBlocks, {})

		expect(container.querySelectorAll('p, ul')).toHaveLength(0)
	})

	it('renders a paragraph', () => {
		const { container } = render(NoteBlocks, { note: 'hello' })

		expect(container.querySelector('p')?.textContent?.trim()).toBe('hello')
	})

	it('renders a bullet list with one item per bullet', () => {
		const { container } = render(NoteBlocks, { note: '- a\n- b' })

		expect(container.querySelectorAll('[data-graph-note-list] li')).toHaveLength(2)
	})

	it('marks an inline code span', () => {
		const { container } = render(NoteBlocks, { note: 'use `id`' })

		expect(container.querySelector('[data-graph-note-code]')?.textContent).toBe('id')
	})

	it('renders a note that repeats the same code span twice', () => {
		// Keying the segment loop by `part.text` — the obvious choice — throws
		// `each_key_duplicate` here and renders nothing. "`a` or `a`" is an entirely ordinary
		// thing for a column comment to say.
		const { container } = render(NoteBlocks, { note: 'either `a` or `a`' })

		expect(container.querySelectorAll('[data-graph-note-code]')).toHaveLength(2)
	})

	it('renders two identical bullets', () => {
		// Same trap one level up: keying the line loop by its content collides too.
		const { container } = render(NoteBlocks, { note: '- same\n- same' })

		expect(container.querySelectorAll('li')).toHaveLength(2)
	})

	it('renders two identical paragraphs', () => {
		const { container } = render(NoteBlocks, { note: 'same\n\nsame' })

		expect(container.querySelectorAll('p')).toHaveLength(2)
	})

	it('escapes markup rather than interpreting it', () => {
		// A DDL comment can contain anything. Nothing here uses {@html}, so a tag arrives as
		// text — this asserts that rather than assuming it.
		const { container } = render(NoteBlocks, { note: '<script>alert(1)</script>' })

		expect(container.querySelector('script')).toBeNull()
		expect(container.textContent).toContain('<script>alert(1)</script>')
	})

	it('renders a paragraph and a list together, in order', () => {
		const { container } = render(NoteBlocks, { note: 'intro\n- a' })
		const kinds = [...container.querySelectorAll('p, ul')].map((el) => el.tagName)

		expect(kinds).toEqual(['P', 'UL'])
	})
})
