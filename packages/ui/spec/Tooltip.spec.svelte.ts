import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import { tick } from 'svelte'
import Tooltip from '../src/components/Tooltip.svelte'

beforeEach(() => {
	vi.useFakeTimers()
})

afterEach(() => {
	vi.useRealTimers()
})

describe('Tooltip', () => {
	// ─── Structure ───────────────────────────────────────────────────

	it('renders data-tooltip-root wrapper', () => {
		const { container } = render(Tooltip, { props: { content: 'Hello' } })
		expect(container.querySelector('[data-tooltip-root]')).toBeTruthy()
	})

	it('renders tooltip content element with role="tooltip"', () => {
		const { container } = render(Tooltip, { props: { content: 'Hello' } })
		const el = container.querySelector('[data-tooltip-content]')
		expect(el).toBeTruthy()
		expect(el?.getAttribute('role')).toBe('tooltip')
	})

	it('renders content text', () => {
		const { container } = render(Tooltip, { props: { content: 'My tip' } })
		expect(container.querySelector('[data-tooltip-content]')?.textContent).toBe('My tip')
	})

	it('links root to tooltip via aria-describedby', () => {
		const { container } = render(Tooltip, { props: { content: 'Hello' } })
		const root = container.querySelector('[data-tooltip-root]')
		const tip = container.querySelector('[data-tooltip-content]')
		expect(root?.getAttribute('aria-describedby')).toBe(tip?.id)
	})

	it('starts hidden', () => {
		const { container } = render(Tooltip, { props: { content: 'Hello' } })
		const tip = container.querySelector('[data-tooltip-content]')
		expect(tip?.getAttribute('data-tooltip-visible')).toBe('false')
	})

	it('sets default position to top', () => {
		const { container } = render(Tooltip, { props: { content: 'Hello' } })
		const tip = container.querySelector('[data-tooltip-content]')
		expect(tip?.getAttribute('data-tooltip-position')).toBe('top')
	})

	it('sets custom position', () => {
		const { container } = render(Tooltip, { props: { content: 'Hello', position: 'right' } })
		const tip = container.querySelector('[data-tooltip-content]')
		expect(tip?.getAttribute('data-tooltip-position')).toBe('right')
	})

	// ─── Interaction ─────────────────────────────────────────────────

	it('shows after delay on mouseenter', async () => {
		const { container } = render(Tooltip, { props: { content: 'Hello', delay: 300 } })
		const root = container.querySelector('[data-tooltip-root]') as HTMLElement
		const tip = container.querySelector('[data-tooltip-content]')

		fireEvent.mouseEnter(root)
		expect(tip?.getAttribute('data-tooltip-visible')).toBe('false')

		vi.advanceTimersByTime(300)
		await tick()
		expect(tip?.getAttribute('data-tooltip-visible')).toBe('true')
	})

	it('hides immediately on mouseleave', async () => {
		const { container } = render(Tooltip, { props: { content: 'Hello', delay: 0 } })
		const root = container.querySelector('[data-tooltip-root]') as HTMLElement
		const tip = container.querySelector('[data-tooltip-content]')

		fireEvent.mouseEnter(root)
		vi.advanceTimersByTime(0)
		await tick()
		expect(tip?.getAttribute('data-tooltip-visible')).toBe('true')

		fireEvent.mouseLeave(root)
		await tick()
		expect(tip?.getAttribute('data-tooltip-visible')).toBe('false')
	})

	it('shows immediately on focusin', async () => {
		const { container } = render(Tooltip, { props: { content: 'Hello' } })
		const root = container.querySelector('[data-tooltip-root]') as HTMLElement
		const tip = container.querySelector('[data-tooltip-content]')

		fireEvent.focusIn(root)
		await tick()
		expect(tip?.getAttribute('data-tooltip-visible')).toBe('true')
	})

	it('hides on focusout', async () => {
		const { container } = render(Tooltip, { props: { content: 'Hello' } })
		const root = container.querySelector('[data-tooltip-root]') as HTMLElement
		const tip = container.querySelector('[data-tooltip-content]')

		fireEvent.focusIn(root)
		await tick()
		fireEvent.focusOut(root)
		await tick()
		expect(tip?.getAttribute('data-tooltip-visible')).toBe('false')
	})

	it('hides on Escape key', async () => {
		const { container } = render(Tooltip, { props: { content: 'Hello' } })
		const root = container.querySelector('[data-tooltip-root]') as HTMLElement
		const tip = container.querySelector('[data-tooltip-content]')

		fireEvent.focusIn(root)
		await tick()
		fireEvent.keyDown(root, { key: 'Escape' })
		await tick()
		expect(tip?.getAttribute('data-tooltip-visible')).toBe('false')
	})
})
