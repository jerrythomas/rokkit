import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import Card from '../src/components/Card.svelte'

describe('Card', () => {
	// ─── Rendering ──────────────────────────────────────────────────

	it('renders a card container', () => {
		const { container } = render(Card)
		expect(container.querySelector('[data-card]')).toBeTruthy()
	})

	it('renders as a div by default', () => {
		const { container } = render(Card)
		const card = container.querySelector('[data-card]')
		expect(card?.tagName).toBe('DIV')
	})

	// ─── Link Card ──────────────────────────────────────────────────

	it('renders as an anchor when href is provided', () => {
		const { container } = render(Card, { href: '/about' })
		const card = container.querySelector('[data-card]')
		expect(card?.tagName).toBe('A')
		expect(card?.getAttribute('href')).toBe('/about')
	})

	// ─── Clickable Card ─────────────────────────────────────────────

	it('renders as a button when onclick is provided', () => {
		const onclick = vi.fn()
		const { container } = render(Card, { onclick })
		const card = container.querySelector('[data-card]')
		expect(card?.tagName).toBe('BUTTON')
	})

	it('has interactive attribute when clickable', () => {
		const onclick = vi.fn()
		const { container } = render(Card, { onclick })
		const card = container.querySelector('[data-card]')
		expect(card?.hasAttribute('data-card-interactive')).toBe(true)
	})

	it('calls onclick when clicked', async () => {
		const onclick = vi.fn()
		const { container } = render(Card, { onclick })
		const card = container.querySelector('[data-card]')!
		await fireEvent.click(card)
		expect(onclick).toHaveBeenCalledOnce()
	})

	// ─── Custom Class ───────────────────────────────────────────────

	it('applies custom class', () => {
		const { container } = render(Card, { class: 'my-card' })
		const card = container.querySelector('[data-card]')
		expect(card?.classList.contains('my-card')).toBe(true)
	})
})
