import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import { ProxyItem } from '@rokkit/states'
import ItemToggle from '../src/components/ItemToggle.svelte'

function proxyFor(data: Record<string, unknown>): ProxyItem {
	return new ProxyItem(data)
}

describe('ItemToggle', () => {
	it('renders one option per entry in the options field', () => {
		const { container } = render(ItemToggle, {
			proxy: proxyFor({
				label: 'Theme',
				value: 'light',
				options: ['light', 'dark', 'auto']
			})
		})
		const opts = container.querySelectorAll('[data-item-toggle-option]')
		expect(opts.length).toBe(3)
	})

	it('marks the current option as selected', () => {
		const { container } = render(ItemToggle, {
			proxy: proxyFor({
				label: 'Theme',
				value: 'dark',
				options: ['light', 'dark', 'auto']
			})
		})
		const opts = container.querySelectorAll('[data-item-toggle-option]')
		expect(opts[0]?.hasAttribute('data-selected')).toBe(false)
		expect(opts[1]?.hasAttribute('data-selected')).toBe(true)
		expect(opts[2]?.hasAttribute('data-selected')).toBe(false)
		expect(opts[1]?.getAttribute('aria-checked')).toBe('true')
	})

	it('supports object options with label / value / icon', () => {
		const { container } = render(ItemToggle, {
			proxy: proxyFor({
				label: 'Align',
				value: 'center',
				options: [
					{ label: 'Left', value: 'left', icon: 'i-align-left' },
					{ label: 'Center', value: 'center', icon: 'i-align-center' },
					{ label: 'Right', value: 'right', icon: 'i-align-right' }
				]
			})
		})
		const opts = container.querySelectorAll('[data-item-toggle-option]')
		expect(opts[1]?.querySelector('[data-item-toggle-label]')?.textContent).toBe('Center')
		expect(opts[1]?.hasAttribute('data-selected')).toBe(true)
		expect(opts[1]?.querySelector('[data-item-toggle-icon]')?.className).toContain('i-align-center')
	})

	it('fires onchange with the picked value', () => {
		const onchange = vi.fn()
		const { container } = render(ItemToggle, {
			proxy: proxyFor({ label: 'Theme', value: 'light', options: ['light', 'dark', 'auto'] }),
			onchange
		})
		const opts = container.querySelectorAll('[data-item-toggle-option]')
		fireEvent.click(opts[2] as Element)
		expect(onchange).toHaveBeenCalledWith('auto', 'auto', expect.any(Object))
		// NOTE: Navigator's isNestedInteractive guard (see actions/navigator.js)
		// ensures the parent List row does NOT also fire onselect when a nested
		// [role="radio"] is clicked — verified in navigator.spec.js.
	})

	it('does not fire onchange when clicking the already-selected option', () => {
		const onchange = vi.fn()
		const { container } = render(ItemToggle, {
			proxy: proxyFor({ label: 'Theme', value: 'dark', options: ['light', 'dark', 'auto'] }),
			onchange
		})
		const selected = container.querySelector(
			'[data-item-toggle-option][data-selected]'
		) as HTMLElement
		fireEvent.click(selected)
		expect(onchange).not.toHaveBeenCalled()
	})

	it('renders no <button>/<input> — nested interactives are role-based spans only', () => {
		const { container } = render(ItemToggle, {
			proxy: proxyFor({ label: 'Theme', value: 'light', options: ['light', 'dark'] })
		})
		expect(container.querySelectorAll('button, input, select, textarea, a[href]').length).toBe(0)
	})

	it('gracefully handles a missing options field', () => {
		const { container } = render(ItemToggle, {
			proxy: proxyFor({ label: 'Theme' })
		})
		expect(container.querySelectorAll('[data-item-toggle-option]').length).toBe(0)
	})

	it('activates via Enter key on a focused option', () => {
		const onchange = vi.fn()
		const { container } = render(ItemToggle, {
			proxy: proxyFor({ label: 'Theme', value: 'light', options: ['light', 'dark'] }),
			onchange
		})
		const target = container.querySelectorAll('[data-item-toggle-option]')[1] as HTMLElement
		fireEvent.keyDown(target, { key: 'Enter' })
		expect(onchange).toHaveBeenCalledWith('dark', 'dark', expect.any(Object))
	})
})
