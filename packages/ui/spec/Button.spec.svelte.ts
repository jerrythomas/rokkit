import { describe, it, expect, beforeEach, vi } from 'vitest'
import { cleanup, render, fireEvent } from '@testing-library/svelte'
import Button from '../src/components/Button.svelte'

/**
 * Button had no spec of its own. The uncovered parts were the variants a caller
 * actually reaches for: the link form, the loading spinner, and the right-hand
 * icon — all of which change the rendered element or its a11y state.
 */

beforeEach(() => cleanup())

describe('Button — element variant', () => {
	it('renders a <button> by default', () => {
		const { container } = render(Button, { props: { label: 'Save' } })

		const el = container.querySelector('[data-button]')
		expect(el?.tagName).toBe('BUTTON')
		expect(el?.getAttribute('type')).toBe('button')
	})

	it('renders an <a> when href is supplied', () => {
		const { container } = render(Button, { props: { label: 'Docs', href: '/docs' } })

		const el = container.querySelector('[data-button]')
		expect(el?.tagName).toBe('A')
		expect(el?.getAttribute('href')).toBe('/docs')
		expect(el?.getAttribute('target')).toBe('_self')
	})

	it('honours an explicit target on the link variant', () => {
		const { container } = render(Button, {
			props: { label: 'Docs', href: '/docs', target: '_blank' }
		})

		expect(container.querySelector('[data-button]')?.getAttribute('target')).toBe('_blank')
	})

	it('falls back to a <button> when a link is disabled', () => {
		// An anchor cannot be disabled, so the disabled link has to degrade to a
		// real button or it stays clickable.
		const { container } = render(Button, {
			props: { label: 'Docs', href: '/docs', disabled: true }
		})

		expect(container.querySelector('[data-button]')?.tagName).toBe('BUTTON')
	})

	it('falls back to a <button> while a link is loading', () => {
		const { container } = render(Button, {
			props: { label: 'Docs', href: '/docs', loading: true }
		})

		expect(container.querySelector('[data-button]')?.tagName).toBe('BUTTON')
	})
})

describe('Button — loading state', () => {
	it('renders a spinner and marks itself busy', () => {
		const { container } = render(Button, { props: { label: 'Save', loading: true } })

		expect(container.querySelector('[data-button-spinner]')).toBeTruthy()
		const el = container.querySelector('[data-button]')
		expect(el?.getAttribute('aria-busy')).toBe('true')
		expect(el?.getAttribute('data-loading')).toBe('true')
	})

	it('renders no spinner when not loading', () => {
		const { container } = render(Button, { props: { label: 'Save' } })

		expect(container.querySelector('[data-button-spinner]')).toBeNull()
		expect(container.querySelector('[data-button]')?.getAttribute('aria-busy')).toBeNull()
	})

	it('disables the control while loading', () => {
		// Asserted on the attribute, not by clicking: fireEvent dispatches straight
		// at the element and bypasses the browser's own disabled handling, so a
		// click-based assertion here would pass whether or not `disabled` was set.
		const { container } = render(Button, { props: { label: 'Save', loading: true } })

		const el = container.querySelector('[data-button]') as HTMLButtonElement
		expect(el.disabled).toBe(true)
		expect(el.getAttribute('data-disabled')).toBe('true')
	})
})

describe('Button — icons', () => {
	it('renders a right-hand icon after the label', () => {
		const { container } = render(Button, {
			props: { label: 'Next', iconRight: 'i-mdi-arrow-right' }
		})

		const right = container.querySelector('[data-button-icon-right]')
		expect(right).toBeTruthy()
		expect(right?.classList.contains('i-mdi-arrow-right')).toBe(true)
		expect(right?.getAttribute('aria-hidden')).toBe('true')
	})

	it('renders no right-hand icon when none is given', () => {
		const { container } = render(Button, { props: { label: 'Next' } })

		expect(container.querySelector('[data-button-icon-right]')).toBeNull()
	})

	it('marks itself icon-only when an icon has no label', () => {
		const { container } = render(Button, { props: { icon: 'i-mdi-close' } })

		expect(container.querySelector('[data-button]')?.getAttribute('data-icon-only')).toBe('true')
	})

	it('is not icon-only once a label is present', () => {
		const { container } = render(Button, { props: { icon: 'i-mdi-close', label: 'Close' } })

		expect(container.querySelector('[data-button]')?.getAttribute('data-icon-only')).toBeNull()
	})

	it('renders the label through the default content renderer', () => {
		const { container } = render(Button, { props: { label: 'Save' } })

		expect(container.querySelector('[data-item-label]')?.textContent).toBe('Save')
	})
})

describe('Button — clicks', () => {
	it('fires onclick when enabled', async () => {
		const onclick = vi.fn()
		const { container } = render(Button, { props: { label: 'Save', onclick } })

		await fireEvent.click(container.querySelector('[data-button]')!)

		expect(onclick).toHaveBeenCalled()
	})

	it('marks the control disabled so the browser suppresses the click', () => {
		const { container } = render(Button, { props: { label: 'Save', disabled: true } })

		const el = container.querySelector('[data-button]') as HTMLButtonElement
		expect(el.disabled).toBe(true)
		expect(el.getAttribute('data-disabled')).toBe('true')
	})
})
