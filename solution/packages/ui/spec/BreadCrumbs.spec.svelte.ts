import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import BreadCrumbs from '../src/components/BreadCrumbs.svelte'

const basicItems = [
	{ label: 'Home', value: 'home' },
	{ label: 'Products', value: 'products' },
	{ label: 'Widget', value: 'widget' }
]

describe('BreadCrumbs', () => {
	// ─── Rendering ──────────────────────────────────────────────────

	it('renders a nav element', () => {
		const { container } = render(BreadCrumbs, { items: basicItems })
		expect(container.querySelector('[data-breadcrumbs]')).toBeTruthy()
	})

	it('has aria-label Breadcrumb', () => {
		const { container } = render(BreadCrumbs, { items: basicItems })
		const nav = container.querySelector('[data-breadcrumbs]')
		expect(nav?.getAttribute('aria-label')).toBe('Breadcrumb')
	})

	it('renders an ordered list', () => {
		const { container } = render(BreadCrumbs, { items: basicItems })
		expect(container.querySelector('[data-breadcrumb-list]')?.tagName).toBe('OL')
	})

	it('renders all items', () => {
		const { container } = render(BreadCrumbs, { items: basicItems })
		const items = container.querySelectorAll('[data-breadcrumb-item]')
		expect(items.length).toBe(3)
	})

	// ─── Separators ─────────────────────────────────────────────────

	it('renders separators between items', () => {
		const { container } = render(BreadCrumbs, { items: basicItems })
		const seps = container.querySelectorAll('[data-breadcrumb-separator]')
		expect(seps.length).toBe(2)
	})

	it('separators are aria-hidden', () => {
		const { container } = render(BreadCrumbs, { items: basicItems })
		const sep = container.querySelector('[data-breadcrumb-separator]')
		expect(sep?.getAttribute('aria-hidden')).toBe('true')
	})

	// ─── Current Item ───────────────────────────────────────────────

	it('marks last item as current', () => {
		const { container } = render(BreadCrumbs, { items: basicItems })
		const items = container.querySelectorAll('[data-breadcrumb-item]')
		expect(items[2]?.hasAttribute('data-current')).toBe(true)
		expect(items[0]?.hasAttribute('data-current')).toBe(false)
	})

	it('last item has aria-current="page"', () => {
		const { container } = render(BreadCrumbs, { items: basicItems })
		const current = container.querySelector('[data-breadcrumb-current]')
		expect(current?.getAttribute('aria-current')).toBe('page')
	})

	it('non-last items are buttons', () => {
		const { container } = render(BreadCrumbs, { items: basicItems })
		const links = container.querySelectorAll('[data-breadcrumb-link]')
		expect(links.length).toBe(2)
		expect(links[0]?.tagName).toBe('BUTTON')
	})

	it('last item is not a button', () => {
		const { container } = render(BreadCrumbs, { items: basicItems })
		const current = container.querySelector('[data-breadcrumb-current]')
		expect(current?.tagName).toBe('SPAN')
	})

	// ─── Click Handling ─────────────────────────────────────────────

	it('calls onclick with value and item', async () => {
		const onclick = vi.fn()
		const { container } = render(BreadCrumbs, { items: basicItems, onclick })
		const links = container.querySelectorAll('[data-breadcrumb-link]')
		await fireEvent.click(links[0])
		expect(onclick).toHaveBeenCalledWith('home', basicItems[0])
	})

	// ─── Custom Fields ──────────────────────────────────────────────

	it('supports custom field mappings', () => {
		const items = [
			{ name: 'Home', id: 'home' },
			{ name: 'Page', id: 'page' }
		]
		const { container } = render(BreadCrumbs, {
			items,
			fields: { label: 'name', value: 'id' }
		})
		const label = container.querySelector('[data-breadcrumb-label]')
		expect(label?.textContent).toBe('Home')
	})

	// ─── Icons ──────────────────────────────────────────────────────

	it('renders icon when present', () => {
		const items = [
			{ label: 'Home', value: 'home', icon: 'i-lucide:home' },
			{ label: 'Page', value: 'page' }
		]
		const { container } = render(BreadCrumbs, { items })
		const icon = container.querySelector('[data-breadcrumb-icon]')
		expect(icon?.classList.contains('i-lucide:home')).toBe(true)
	})

	// ─── Icons ──────────────────────────────────────────────────────

	it('renders default semantic navigate-right separator icon', () => {
		const { container } = render(BreadCrumbs, { items: basicItems })
		const sep = container.querySelector('[data-breadcrumb-separator] span')
		expect(sep?.classList.contains('navigate-right')).toBe(true)
	})

	it('uses custom separator icon override', () => {
		const { container } = render(BreadCrumbs, { items: basicItems, icons: { separator: 'custom-arrow' } })
		const sep = container.querySelector('[data-breadcrumb-separator] span')
		expect(sep?.classList.contains('custom-arrow')).toBe(true)
	})

	// ─── Custom Class ───────────────────────────────────────────────

	it('applies custom class', () => {
		const { container } = render(BreadCrumbs, { items: basicItems, class: 'my-crumbs' })
		const el = container.querySelector('[data-breadcrumbs]')
		expect(el?.classList.contains('my-crumbs')).toBe(true)
	})

	// ─── Empty State ────────────────────────────────────────────────

	it('renders empty with no items', () => {
		const { container } = render(BreadCrumbs, { items: [] })
		const nav = container.querySelector('[data-breadcrumbs]')
		expect(nav).toBeTruthy()
		expect(container.querySelectorAll('[data-breadcrumb-item]').length).toBe(0)
	})

	// ─── Single Item ────────────────────────────────────────────────

	it('single item is marked current with no separators', () => {
		const items = [{ label: 'Home', value: 'home' }]
		const { container } = render(BreadCrumbs, { items })
		expect(container.querySelectorAll('[data-breadcrumb-separator]').length).toBe(0)
		expect(container.querySelector('[data-breadcrumb-current]')).toBeTruthy()
	})

	// ─── Translatable Labels ────────────────────────────────────────

	it('uses default label from MessagesStore', () => {
		const { container } = render(BreadCrumbs, { items: basicItems })
		const nav = container.querySelector('[data-breadcrumbs]')
		expect(nav?.getAttribute('aria-label')).toBe('Breadcrumb')
	})

	it('allows custom label prop to override default', () => {
		const { container } = render(BreadCrumbs, { items: basicItems, label: 'Fil d\'Ariane' })
		const nav = container.querySelector('[data-breadcrumbs]')
		expect(nav?.getAttribute('aria-label')).toBe('Fil d\'Ariane')
	})
})
