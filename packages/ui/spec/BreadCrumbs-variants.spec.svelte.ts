import { describe, it, expect, beforeEach, vi } from 'vitest'
import { cleanup, render, fireEvent } from '@testing-library/svelte'
import BreadCrumbs from '../src/components/BreadCrumbs.svelte'
import BreadCrumbsTest from './BreadCrumbsTest.svelte'

/**
 * A crumb renders as one of three elements — the current page as a plain span,
 * an item with an href as a link, and everything else as a button — and each of
 * those wraps either the consumer's `crumb` snippet or the default. Only one of
 * the six combinations had ever rendered.
 */

beforeEach(() => cleanup())

const withHref = [
	{ label: 'Home', href: '/' },
	{ label: 'Docs', href: '/docs' },
	{ label: 'Current', href: '/docs/current' }
]
const withoutHref = [{ label: 'Home' }, { label: 'Section' }, { label: 'Current' }]

describe('BreadCrumbs — element per crumb', () => {
	it('renders the last crumb as the current page, not a control', () => {
		const { container } = render(BreadCrumbs, { props: { items: withHref } })

		const current = container.querySelector('[data-breadcrumb-current]')
		expect(current).toBeTruthy()
		expect(current?.getAttribute('aria-current')).toBe('page')
		// The last item must not also be a link.
		const items = container.querySelectorAll('[data-breadcrumb-item]')
		expect(items[items.length - 1].querySelector('a')).toBeNull()
	})

	it('renders an anchor for a crumb that has an href', () => {
		const { container } = render(BreadCrumbs, { props: { items: withHref } })

		const link = container.querySelector('a[data-breadcrumb-link]')
		expect(link).toBeTruthy()
		expect(link?.getAttribute('href')).toBe('/')
	})

	it('renders a button for a crumb with no href', () => {
		const { container } = render(BreadCrumbs, { props: { items: withoutHref } })

		const button = container.querySelector('button[data-breadcrumb-link]')
		expect(button).toBeTruthy()
		expect(container.querySelector('a[data-breadcrumb-link]')).toBeNull()
	})

	it('puts a separator between crumbs but not before the first', () => {
		const { container } = render(BreadCrumbs, { props: { items: withHref } })

		expect(container.querySelectorAll('[data-breadcrumb-separator]')).toHaveLength(2)
	})

	it('renders nothing but the container for the default empty items', () => {
		const { container } = render(BreadCrumbs)

		expect(container.querySelectorAll('[data-breadcrumb-item]')).toHaveLength(0)
	})
})

describe('BreadCrumbs — navigation callbacks', () => {
	it('reports a click on a link crumb with its value', async () => {
		const onclick = vi.fn()
		const { container } = render(BreadCrumbs, { props: { items: withHref, onclick } })

		await fireEvent.click(container.querySelector('a[data-breadcrumb-link]')!)

		expect(onclick).toHaveBeenCalled()
		// Second argument is the original item, so callers can route on more than
		// the extracted value.
		expect(onclick.mock.calls[0][1]).toEqual(expect.objectContaining({ label: 'Home' }))
	})

	it('reports a click on a button crumb', async () => {
		const onclick = vi.fn()
		const { container } = render(BreadCrumbs, { props: { items: withoutHref, onclick } })

		await fireEvent.click(container.querySelector('button[data-breadcrumb-link]')!)

		expect(onclick).toHaveBeenCalled()
	})
})

describe('BreadCrumbs — custom crumb snippet', () => {
	it('uses the snippet inside the current-page span', () => {
		const { container } = render(BreadCrumbsTest, {
			props: { withCrumbSnippet: true, items: withHref }
		})

		const current = container.querySelector('[data-breadcrumb-current]')
		expect(current?.querySelector('[data-custom-crumb]')).toBeTruthy()
		expect(current?.querySelector('[data-custom-last]')).toBeTruthy()
	})

	it('uses the snippet inside a link crumb', () => {
		const { container } = render(BreadCrumbsTest, {
			props: { withCrumbSnippet: true, items: withHref }
		})

		expect(
			container.querySelector('a[data-breadcrumb-link] [data-custom-crumb]')
		).toBeTruthy()
	})

	it('uses the snippet inside a button crumb', () => {
		const { container } = render(BreadCrumbsTest, {
			props: { withCrumbSnippet: true, items: withoutHref }
		})

		expect(
			container.querySelector('button[data-breadcrumb-link] [data-custom-crumb]')
		).toBeTruthy()
	})
})
