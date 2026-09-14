import { describe, it, expect, beforeEach } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import { ProxyItem } from '@rokkit/states'
import ItemContent from '../src/components/ItemContent.svelte'

/**
 * ItemContent is the default inner renderer for List / Menu / Tree / Toolbar /
 * Select / Grid items, and it is the reason those components are "data-first":
 * an avatar, icon, subtext, badge or shortcut comes straight off the item rather
 * than requiring a snippet.
 *
 * It had no spec of its own — only whatever the parent components happened to
 * exercise — so every optional field above the label was unrendered.
 *
 * Raw fixtures use BASE_FIELDS' RAW keys, which differ from the semantic names:
 * avatar→`image`, subtext→`description`, tooltip→`title`.
 */

const proxyFor = (item: Record<string, unknown>, fields = {}) =>
	new ProxyItem(item, fields, '0', 1)

beforeEach(() => cleanup())

describe('ItemContent — label and subtext', () => {
	it('renders the label', () => {
		const { container } = render(ItemContent, { props: { proxy: proxyFor({ label: 'Alpha' }) } })

		expect(container.querySelector('[data-item-label]')?.textContent).toBe('Alpha')
	})

	it('renders the subtext beneath the label', () => {
		const { container } = render(ItemContent, {
			props: { proxy: proxyFor({ label: 'Alpha', description: 'second line' }) }
		})

		expect(container.querySelector('[data-item-description]')?.textContent).toBe('second line')
	})

	it('omits the subtext when showSubtext is false', () => {
		const { container } = render(ItemContent, {
			props: { proxy: proxyFor({ label: 'Alpha', description: 'second line' }), showSubtext: false }
		})

		expect(container.querySelector('[data-item-description]')).toBeNull()
		expect(container.querySelector('[data-item-label]')).toBeTruthy()
	})
})

describe('ItemContent — avatar and icon', () => {
	it('renders an avatar image when the item carries one', () => {
		const { container } = render(ItemContent, {
			props: { proxy: proxyFor({ label: 'Ada', image: '/ada.png' }) }
		})

		const img = container.querySelector('[data-item-avatar]') as HTMLImageElement
		expect(img).toBeTruthy()
		expect(img.getAttribute('src')).toBe('/ada.png')
		// Falls back to the label when no explicit tooltip is given.
		expect(img.getAttribute('alt')).toBe('Ada')
	})

	it('prefers an explicit tooltip for the avatar alt text', () => {
		const { container } = render(ItemContent, {
			props: { proxy: proxyFor({ label: 'Ada', image: '/ada.png', title: 'Ada Lovelace' }) }
		})

		expect(container.querySelector('[data-item-avatar]')?.getAttribute('alt')).toBe('Ada Lovelace')
	})

	it('prefers the avatar over an icon when both are present', () => {
		const { container } = render(ItemContent, {
			props: { proxy: proxyFor({ label: 'Ada', image: '/ada.png', icon: 'i-mdi-account' }) }
		})

		expect(container.querySelector('[data-item-avatar]')).toBeTruthy()
		expect(container.querySelector('[data-item-icon]')).toBeNull()
	})

	it('renders an icon class as a styled span', () => {
		const { container } = render(ItemContent, {
			props: { proxy: proxyFor({ label: 'Alpha', icon: 'i-mdi-check' }) }
		})

		const icon = container.querySelector('[data-item-icon]')
		expect(icon).toBeTruthy()
		expect(icon?.classList.contains('i-mdi-check')).toBe(true)
		expect(container.querySelector('[data-item-icon-literal]')).toBeNull()
	})

	it('renders a non-class icon as literal text', () => {
		// An emoji or single character is not an icon class — it is the glyph
		// itself, and must be printed rather than turned into a class name.
		const { container } = render(ItemContent, {
			props: { proxy: proxyFor({ label: 'Alpha', icon: '🚀' }) }
		})

		const literal = container.querySelector('[data-item-icon-literal]')
		expect(literal).toBeTruthy()
		expect(literal?.textContent).toBe('🚀')
		expect(container.querySelector('[data-item-icon]')).toBeNull()
	})

	it('omits all iconography when showIcon is false', () => {
		const { container } = render(ItemContent, {
			props: { proxy: proxyFor({ label: 'Ada', image: '/ada.png', icon: 'i-mdi-check' }), showIcon: false }
		})

		expect(container.querySelector('[data-item-avatar]')).toBeNull()
		expect(container.querySelector('[data-item-icon]')).toBeNull()
	})
})

describe('ItemContent — badge and shortcut', () => {
	it('renders a badge when present', () => {
		const { container } = render(ItemContent, {
			props: { proxy: proxyFor({ label: 'Inbox', badge: 12 }) }
		})

		expect(container.querySelector('[data-item-badge]')?.textContent).toBe('12')
	})

	it('renders a shortcut in a <kbd>', () => {
		const { container } = render(ItemContent, {
			props: { proxy: proxyFor({ label: 'Save', shortcut: 'mod+s' }) }
		})

		const kbd = container.querySelector('[data-item-shortcut]')
		expect(kbd?.tagName).toBe('KBD')
		expect(kbd?.textContent).toBe('mod+s')
	})

	it('omits both when the item has neither', () => {
		const { container } = render(ItemContent, { props: { proxy: proxyFor({ label: 'Plain' }) } })

		expect(container.querySelector('[data-item-badge]')).toBeNull()
		expect(container.querySelector('[data-item-shortcut]')).toBeNull()
	})

	it('renders badge and shortcut together', () => {
		const { container } = render(ItemContent, {
			props: { proxy: proxyFor({ label: 'Search', badge: 'new', shortcut: 'mod+k' }) }
		})

		expect(container.querySelector('[data-item-badge]')).toBeTruthy()
		expect(container.querySelector('[data-item-shortcut]')).toBeTruthy()
	})
})

describe('ItemContent — field mapping', () => {
	it('reads every field through the fields map', () => {
		// The whole point of the data-first contract: the item's own key names are
		// arbitrary and the fields map adapts them.
		const proxy = proxyFor(
			{ name: 'Mapped', note: 'sub', pic: '/p.png', count: 3, keys: 'mod+m' },
			{ label: 'name', subtext: 'note', avatar: 'pic', badge: 'count', shortcut: 'keys' }
		)
		const { container } = render(ItemContent, { props: { proxy } })

		expect(container.querySelector('[data-item-label]')?.textContent).toBe('Mapped')
		expect(container.querySelector('[data-item-description]')?.textContent).toBe('sub')
		expect(container.querySelector('[data-item-avatar]')?.getAttribute('src')).toBe('/p.png')
		expect(container.querySelector('[data-item-badge]')?.textContent).toBe('3')
		expect(container.querySelector('[data-item-shortcut]')?.textContent).toBe('mod+m')
	})
})
