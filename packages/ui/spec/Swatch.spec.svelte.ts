import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import SwatchTest from './SwatchTest.svelte'

const colors = ['red', 'green', 'blue']
const objectColors = [
	{ value: '#ff0000', fill: '#ff0000', label: 'Red' },
	{ value: '#00ff00', fill: '#00ff00', label: 'Green' },
	{ value: '#0000ff', fill: '#0000ff', label: 'Blue' }
]

describe('Swatch', () => {
	// ─── Rendering ──────────────────────────────────────────────────

	it('renders a data-swatch container', () => {
		const { container } = render(SwatchTest, { props: { options: colors } })
		expect(container.querySelector('[data-swatch]')).toBeTruthy()
	})

	it('renders one button per option', () => {
		const { container } = render(SwatchTest, { props: { options: colors } })
		expect(container.querySelectorAll('[data-swatch-item]').length).toBe(3)
	})

	it('renders empty when no options', () => {
		const { container } = render(SwatchTest)
		expect(container.querySelectorAll('[data-swatch-item]').length).toBe(0)
	})

	// ─── Shape ────────────────────────────────────────────────────────

	it('defaults to shape="square" — renders square spans', () => {
		const { container } = render(SwatchTest, { props: { options: colors, shape: 'square' } })
		expect(container.querySelector('[data-swatch-square]')).toBeTruthy()
		expect(container.querySelector('[data-swatch-circle]')).toBeNull()
	})

	it('renders circle spans when shape="circle"', () => {
		const { container } = render(SwatchTest, { props: { options: colors, shape: 'circle' } })
		expect(container.querySelector('[data-swatch-circle]')).toBeTruthy()
		expect(container.querySelector('[data-swatch-square]')).toBeNull()
	})

	it('sets data-swatch-shape attribute', () => {
		const { container } = render(SwatchTest, { props: { options: colors, shape: 'circle' } })
		expect(container.querySelector('[data-swatch]')?.getAttribute('data-swatch-shape')).toBe('circle')
	})

	// ─── Size ─────────────────────────────────────────────────────────

	it('defaults to size="md"', () => {
		const { container } = render(SwatchTest, { props: { options: colors } })
		expect(container.querySelector('[data-swatch]')?.getAttribute('data-swatch-size')).toBe('md')
	})

	it('applies size="sm"', () => {
		const { container } = render(SwatchTest, { props: { options: colors, size: 'sm' } })
		expect(container.querySelector('[data-swatch]')?.getAttribute('data-swatch-size')).toBe('sm')
	})

	it('applies size="lg"', () => {
		const { container } = render(SwatchTest, { props: { options: colors, size: 'lg' } })
		expect(container.querySelector('[data-swatch]')?.getAttribute('data-swatch-size')).toBe('lg')
	})

	// ─── ARIA ─────────────────────────────────────────────────────────

	it('has role="radiogroup" in single-select mode', () => {
		const { container } = render(SwatchTest, { props: { options: colors } })
		expect(container.querySelector('[data-swatch]')?.getAttribute('role')).toBe('radiogroup')
	})

	it('has role="group" in multiple-select mode', () => {
		const { container } = render(SwatchTest, { props: { options: colors, multiple: true } })
		expect(container.querySelector('[data-swatch]')?.getAttribute('role')).toBe('group')
	})

	it('items have role="radio" in single-select mode', () => {
		const { container } = render(SwatchTest, { props: { options: colors } })
		const items = container.querySelectorAll('[data-swatch-item]')
		items.forEach((item) => {
			expect(item.getAttribute('role')).toBe('radio')
		})
	})

	it('items have role="checkbox" in multiple-select mode', () => {
		const { container } = render(SwatchTest, { props: { options: colors, multiple: true } })
		const items = container.querySelectorAll('[data-swatch-item]')
		items.forEach((item) => {
			expect(item.getAttribute('role')).toBe('checkbox')
		})
	})

	it('uses label prop as aria-label', () => {
		const { container } = render(SwatchTest, { props: { options: colors, label: 'Pick color' } })
		expect(container.querySelector('[data-swatch]')?.getAttribute('aria-label')).toBe('Pick color')
	})

	// ─── Disabled ─────────────────────────────────────────────────────

	it('sets data-swatch-disabled when disabled', () => {
		const { container } = render(SwatchTest, { props: { options: colors, disabled: true } })
		expect(container.querySelector('[data-swatch]')?.hasAttribute('data-swatch-disabled')).toBe(true)
	})

	it('sets aria-disabled when disabled', () => {
		const { container } = render(SwatchTest, { props: { options: colors, disabled: true } })
		expect(container.querySelector('[data-swatch]')?.getAttribute('aria-disabled')).toBe('true')
	})

	it('buttons are disabled when disabled', () => {
		const { container } = render(SwatchTest, { props: { options: colors, disabled: true } })
		const items = container.querySelectorAll<HTMLButtonElement>('[data-swatch-item]')
		items.forEach((item) => {
			expect(item.disabled).toBe(true)
		})
	})

	it('does not set data-swatch-disabled when not disabled', () => {
		const { container } = render(SwatchTest, { props: { options: colors } })
		expect(container.querySelector('[data-swatch]')?.getAttribute('data-swatch-disabled')).toBeNull()
	})

	// ─── Selection ────────────────────────────────────────────────────

	it('marks selected item with data-selected', () => {
		const { container } = render(SwatchTest, { props: { options: colors, value: 'green' } })
		const items = container.querySelectorAll('[data-swatch-item]')
		expect(items[0].hasAttribute('data-selected')).toBe(false)
		expect(items[1].hasAttribute('data-selected')).toBe(true)
		expect(items[2].hasAttribute('data-selected')).toBe(false)
	})

	it('aria-checked=true on selected item', () => {
		const { container } = render(SwatchTest, { props: { options: colors, value: 'red' } })
		const items = container.querySelectorAll('[data-swatch-item]')
		expect(items[0].getAttribute('aria-checked')).toBe('true')
	})

	it('aria-checked=false on unselected items', () => {
		const { container } = render(SwatchTest, { props: { options: colors, value: 'red' } })
		const items = container.querySelectorAll('[data-swatch-item]')
		expect(items[1].getAttribute('aria-checked')).toBe('false')
	})

	// ─── Click interaction ────────────────────────────────────────────

	it('calls onchange when item is clicked', async () => {
		const onchange = vi.fn()
		const { container } = render(SwatchTest, { props: { options: colors, onchange } })
		const item = container.querySelectorAll('[data-swatch-item]')[0] as HTMLElement
		await fireEvent.click(item)
		expect(onchange).toHaveBeenCalledWith('red', 'red')
	})

	it('does not call onchange when disabled', async () => {
		const onchange = vi.fn()
		const { container } = render(SwatchTest, { props: { options: colors, disabled: true, onchange } })
		const item = container.querySelectorAll('[data-swatch-item]')[0] as HTMLElement
		await fireEvent.click(item)
		expect(onchange).not.toHaveBeenCalled()
	})

	// ─── Multiple selection ────────────────────────────────────────────

	it('sets data-swatch-multiple in multiple mode', () => {
		const { container } = render(SwatchTest, { props: { options: colors, multiple: true } })
		expect(container.querySelector('[data-swatch]')?.hasAttribute('data-swatch-multiple')).toBe(true)
	})

	it('supports multiple selection — calling onchange with array', async () => {
		const onchange = vi.fn()
		const { container } = render(SwatchTest, { props: { options: colors, multiple: true, value: [], onchange } })
		const item = container.querySelectorAll('[data-swatch-item]')[0] as HTMLElement
		await fireEvent.click(item)
		expect(onchange).toHaveBeenCalledWith(['red'], 'red')
	})

	// ─── Fill / style ─────────────────────────────────────────────────

	it('sets --swatch-fill style when object options have fill', () => {
		const { container } = render(SwatchTest, {
			props: {
				options: objectColors,
				fields: { value: 'value', fill: 'fill', label: 'label' }
			}
		})
		const firstItem = container.querySelectorAll('[data-swatch-item]')[0] as HTMLElement
		expect(firstItem.style.getPropertyValue('--swatch-fill')).toBe('#ff0000')
	})

	// ─── Custom class ─────────────────────────────────────────────────

	it('applies custom CSS class', () => {
		const { container } = render(SwatchTest, { props: { options: colors, class: 'my-swatch' } })
		expect(container.querySelector('[data-swatch]')?.classList.contains('my-swatch')).toBe(true)
	})
})
