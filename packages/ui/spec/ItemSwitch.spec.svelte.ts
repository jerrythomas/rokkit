import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import { ProxyItem } from '@rokkit/states'
import ItemSwitch from '../src/components/ItemSwitch.svelte'

function proxyFor(data: Record<string, unknown>): ProxyItem {
	return new ProxyItem(data)
}

describe('ItemSwitch', () => {
	it('renders the item label via ItemContent', () => {
		const { container } = render(ItemSwitch, { proxy: proxyFor({ label: 'Notifications' }) })
		expect(container.querySelector('[data-item-label]')?.textContent).toBe('Notifications')
	})

	it('renders a data-item-switch element with data-switch hooks', () => {
		const { container } = render(ItemSwitch, { proxy: proxyFor({ label: 'X' }) })
		const sw = container.querySelector('[data-item-switch]')
		expect(sw).toBeTruthy()
		expect(sw?.querySelector('[data-switch-track]')).toBeTruthy()
		expect(sw?.querySelector('[data-switch-thumb]')).toBeTruthy()
	})

	it('reflects checked state via aria-checked="true"', () => {
		const { container } = render(ItemSwitch, {
			proxy: proxyFor({ label: 'X', checked: true })
		})
		expect(container.querySelector('[data-item-switch]')?.getAttribute('aria-checked')).toBe('true')
	})

	it('reflects unchecked state via aria-checked="false"', () => {
		const { container } = render(ItemSwitch, {
			proxy: proxyFor({ label: 'X', checked: false })
		})
		expect(container.querySelector('[data-item-switch]')?.getAttribute('aria-checked')).toBe(
			'false'
		)
	})

	it('reads state from a custom field name', () => {
		const { container } = render(ItemSwitch, {
			proxy: proxyFor({ label: 'X', enabled: true }),
			field: 'enabled'
		})
		expect(container.querySelector('[data-item-switch]')?.getAttribute('aria-checked')).toBe('true')
	})

	it('applies the size attribute', () => {
		const { container } = render(ItemSwitch, {
			proxy: proxyFor({ label: 'X' }),
			size: 'sm'
		})
		expect(container.querySelector('[data-item-switch]')?.getAttribute('data-switch-size')).toBe(
			'sm'
		)
	})

	it('the visual is aria-hidden so it does not double-announce', () => {
		const { container } = render(ItemSwitch, { proxy: proxyFor({ label: 'X', checked: true }) })
		expect(container.querySelector('[data-item-switch]')?.getAttribute('aria-hidden')).toBe('true')
	})

	it('renders no nested interactive element inside the item snippet', () => {
		// The whole point: ItemSwitch must not introduce a nested button / input /
		// [role=button] — otherwise it breaks HTML nesting rules and defeats the
		// row-click-toggles model.
		const { container } = render(ItemSwitch, { proxy: proxyFor({ label: 'X', checked: true }) })
		const interactives = container.querySelectorAll(
			'button, input, select, textarea, a[href], [role="button"], [role="switch"], [role="checkbox"], [contenteditable]'
		)
		expect(interactives.length).toBe(0)
	})
})
