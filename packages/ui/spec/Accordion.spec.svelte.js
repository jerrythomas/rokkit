import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, cleanup, fireEvent } from '@testing-library/svelte'
import Accordion from '../src/Accordion.svelte'
import { flushSync } from 'svelte'

describe('Accordion', () => {
	const items = [
		{ text: 'Item 1', children: [{ text: 'Child 1' }, { text: 'Child 2' }] },
		{ text: 'Item 2', children: [{ text: 'Child 3' }, { text: 'Child 4' }] }
	]
	beforeEach(() => cleanup())

	it('should render accordion', () => {
		const props = $state({ items })
		const { container } = render(Accordion, props)
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()

		props.class = 'another-class'
		flushSync()
		expect(container).toMatchSnapshot()
	})

	it('should render empty accordion with default message', () => {
		const props = $state({ items: [] })
		const { container } = render(Accordion, props)
		expect(container).toBeTruthy()
		const empty = container.querySelector('[data-accordion-empty]')
		expect(empty).toBeTruthy()
		expect(empty.textContent).toContain('No items found')
	})

	it('should handle click on accordion trigger', async () => {
		const onselect = vi.fn()
		const props = $state({ items, onselect })
		const { container } = render(Accordion, props)

		const trigger = container.querySelector('[data-accordion-trigger]')
		expect(trigger).toBeTruthy()
		expect(trigger.getAttribute('data-path')).toBe('0')

		await fireEvent.click(trigger)
		expect(onselect).toHaveBeenCalled()
	})

	it('should toggle expansion when clicking accordion icon', async () => {
		const ontoggle = vi.fn()
		const props = $state({ items, ontoggle })
		const { container } = render(Accordion, props)

		const icon = container.querySelector('[data-tag-icon]')
		expect(icon).toBeTruthy()

		await fireEvent.click(icon)
		expect(ontoggle).toHaveBeenCalled()
	})

	it('should handle keyboard navigation', async () => {
		const onselect = vi.fn()
		const props = $state({ items, onselect })
		const { container } = render(Accordion, props)

		const root = container.querySelector('[data-accordion-root]')
		expect(root).toBeTruthy()

		// Focus the accordion
		root.focus()

		// Navigate down
		await fireEvent.keyUp(root, { key: 'ArrowDown' })

		// Select with Enter
		await fireEvent.keyUp(root, { key: 'Enter' })
		expect(onselect).toHaveBeenCalled()
	})
})
