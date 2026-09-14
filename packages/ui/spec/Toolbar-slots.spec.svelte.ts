import { describe, it, expect, beforeEach } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import Toolbar from '../src/components/Toolbar.svelte'
import ToolbarSlotsTest from './ToolbarSlotsTest.svelte'

/**
 * Toolbar has two mutually exclusive modes: data-driven `items`, and a
 * slot-based start/center/end layout. Only the first had been exercised, so the
 * entire slot arrangement — sections, the dividers between them, and the spacer
 * that pushes `end` right when there is no centre — never rendered.
 */

beforeEach(() => cleanup())

const section = (c: Element, name: string) =>
	c.querySelector(`[data-toolbar-section="${name}"]`)

describe('Toolbar — slot layout', () => {
	it('renders each supplied section', () => {
		const { container } = render(ToolbarSlotsTest, {
			props: { withStart: true, withCenter: true, withEnd: true }
		})

		expect(section(container, 'start')?.querySelector('[data-slot-start]')).toBeTruthy()
		expect(section(container, 'center')?.querySelector('[data-slot-center]')).toBeTruthy()
		expect(section(container, 'end')?.querySelector('[data-slot-end]')).toBeTruthy()
	})

	it('puts a divider between start and centre, and centre and end', () => {
		const { container } = render(ToolbarSlotsTest, {
			props: { withStart: true, withCenter: true, withEnd: true, showDividers: true }
		})

		expect(container.querySelectorAll('[data-toolbar-divider]')).toHaveLength(2)
	})

	it('omits dividers when showDividers is off', () => {
		const { container } = render(ToolbarSlotsTest, {
			props: { withStart: true, withCenter: true, withEnd: true, showDividers: false }
		})

		expect(container.querySelector('[data-toolbar-divider]')).toBeNull()
	})

	it('draws no divider after start when nothing follows it', () => {
		const { container } = render(ToolbarSlotsTest, {
			props: { withStart: true, showDividers: true }
		})

		expect(container.querySelector('[data-toolbar-divider]')).toBeNull()
	})

	it('inserts a spacer instead of a centre section when there is none', () => {
		// The spacer is what pushes `end` to the right edge.
		const { container } = render(ToolbarSlotsTest, {
			props: { withStart: true, withEnd: true }
		})

		expect(container.querySelector('[data-toolbar-spacer]')).toBeTruthy()
		expect(section(container, 'center')).toBeNull()
	})

	it('renders bare children in a content section when no other slot is used', () => {
		const { container } = render(ToolbarSlotsTest, { props: { withChildren: true } })

		const content = section(container, 'content')
		expect(content?.querySelector('[data-slot-children]')).toBeTruthy()
		expect(container.querySelector('[data-toolbar-spacer]')).toBeNull()
	})

	it('prefers the spacer over children once start or end is present', () => {
		const { container } = render(ToolbarSlotsTest, {
			props: { withChildren: true, withStart: true }
		})

		expect(section(container, 'content')).toBeNull()
		expect(container.querySelector('[data-toolbar-spacer]')).toBeTruthy()
	})

	it('renders no sections at all when neither items nor slots are given', () => {
		const { container } = render(Toolbar)

		expect(container.querySelector('[data-toolbar-section]')).toBeNull()
		expect(container.querySelector('[data-toolbar-spacer]')).toBeNull()
	})
})
