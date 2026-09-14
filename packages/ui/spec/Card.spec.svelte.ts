import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import Card from '../src/components/Card.svelte'
import CardTest from './CardTest.svelte'

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

// ─── Slots ────────────────────────────────────────────────────────────────────
// Card's three regions are snippets, which `render(Card, { props })` cannot
// supply — so none of them had ever rendered. Each wraps its content in its own
// region element, which is what the theme CSS hangs padding and dividers off.

describe('Card — header, body and footer regions', () => {
	it('renders no regions when no snippets are supplied', () => {
		const { container } = render(CardTest)

		expect(container.querySelector('[data-card-header]')).toBeNull()
		expect(container.querySelector('[data-card-body]')).toBeNull()
		expect(container.querySelector('[data-card-footer]')).toBeNull()
	})

	it('renders the header region', () => {
		const { container } = render(CardTest, { props: { withHeader: true } })

		const header = container.querySelector('[data-card-header]')
		expect(header).toBeTruthy()
		expect(header?.querySelector('[data-test-header]')).toBeTruthy()
	})

	it('renders the body region', () => {
		const { container } = render(CardTest, { props: { withBody: true } })

		const body = container.querySelector('[data-card-body]')
		expect(body).toBeTruthy()
		expect(body?.querySelector('[data-test-body]')).toBeTruthy()
	})

	it('renders the footer region', () => {
		const { container } = render(CardTest, { props: { withFooter: true } })

		const footer = container.querySelector('[data-card-footer]')
		expect(footer).toBeTruthy()
		expect(footer?.querySelector('[data-test-footer]')).toBeTruthy()
	})

	it('renders all three in order', () => {
		const { container } = render(CardTest, {
			props: { withHeader: true, withBody: true, withFooter: true }
		})

		const regions = [...container.querySelectorAll('[data-card] > *')].map((el) =>
			el.hasAttribute('data-card-header')
				? 'header'
				: el.hasAttribute('data-card-body')
					? 'body'
					: el.hasAttribute('data-card-footer')
						? 'footer'
						: 'other'
		)
		expect(regions).toEqual(['header', 'body', 'footer'])
	})

	it('keeps the regions inside the link variant', () => {
		const { container } = render(CardTest, {
			props: { withHeader: true, withBody: true, href: '/somewhere' }
		})

		const card = container.querySelector('[data-card]')
		expect(card?.tagName).toBe('A')
		expect(card?.querySelector('[data-card-header]')).toBeTruthy()
		expect(card?.querySelector('[data-card-body]')).toBeTruthy()
	})
})
