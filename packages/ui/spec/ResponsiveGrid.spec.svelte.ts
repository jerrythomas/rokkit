import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import ResponsiveGridTest from './ResponsiveGridTest.svelte'

describe('ResponsiveGrid', () => {
	// ─── Rendering ──────────────────────────────────────────────────

	it('renders a data-responsive-grid container', () => {
		const { container } = render(ResponsiveGridTest)
		expect(container.querySelector('[data-responsive-grid]')).toBeTruthy()
	})

	it('renders children', () => {
		const { container } = render(ResponsiveGridTest)
		expect(container.querySelectorAll('[data-grid-child]').length).toBe(3)
	})

	// ─── CSS Custom Properties ────────────────────────────────────────

	it('sets --grid-min-width CSS custom property with default', () => {
		const { container } = render(ResponsiveGridTest)
		const el = container.querySelector('[data-responsive-grid]') as HTMLElement
		expect(el.style.getPropertyValue('--grid-min-width')).toBe('240px')
	})

	it('sets --grid-min-width with custom value', () => {
		const { container } = render(ResponsiveGridTest, { props: { minWidth: '320px' } })
		const el = container.querySelector('[data-responsive-grid]') as HTMLElement
		expect(el.style.getPropertyValue('--grid-min-width')).toBe('320px')
	})

	it('sets --grid-gap CSS custom property with default', () => {
		const { container } = render(ResponsiveGridTest)
		const el = container.querySelector('[data-responsive-grid]') as HTMLElement
		expect(el.style.getPropertyValue('--grid-gap')).toBe('1rem')
	})

	it('sets --grid-gap with custom value', () => {
		const { container } = render(ResponsiveGridTest, { props: { gap: '2rem' } })
		const el = container.querySelector('[data-responsive-grid]') as HTMLElement
		expect(el.style.getPropertyValue('--grid-gap')).toBe('2rem')
	})

	it('does not set --grid-max-cols when maxCols is not provided', () => {
		const { container } = render(ResponsiveGridTest)
		const el = container.querySelector('[data-responsive-grid]') as HTMLElement
		expect(el.style.getPropertyValue('--grid-max-cols')).toBe('')
	})

	it('sets --grid-max-cols when maxCols is provided', () => {
		const { container } = render(ResponsiveGridTest, { props: { maxCols: 4 } })
		const el = container.querySelector('[data-responsive-grid]') as HTMLElement
		expect(el.style.getPropertyValue('--grid-max-cols')).toBe('4')
	})

	// ─── Custom class ─────────────────────────────────────────────────

	it('applies custom CSS class', () => {
		const { container } = render(ResponsiveGridTest, { props: { class: 'my-grid' } })
		expect(container.querySelector('[data-responsive-grid]')?.classList.contains('my-grid')).toBe(true)
	})

	it('does not add class attribute when className is empty', () => {
		const { container } = render(ResponsiveGridTest)
		expect(container.querySelector('[data-responsive-grid]')?.getAttribute('class')).toBeNull()
	})
})
