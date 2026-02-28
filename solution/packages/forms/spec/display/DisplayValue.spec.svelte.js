import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import DisplayValue from '../../src/display/DisplayValue.svelte'

describe('DisplayValue', () => {
	it('should render text value by default', () => {
		const { container } = render(DisplayValue, { props: { value: 'hello' } })
		const el = container.querySelector('[data-display-value]')
		expect(el).toBeTruthy()
		expect(el.textContent).toBe('hello')
		expect(el.getAttribute('data-format')).toBe('text')
	})

	it('should render em-dash for null value', () => {
		const { container } = render(DisplayValue, { props: { value: null } })
		expect(container.querySelector('[data-display-value]').textContent).toBe('—')
	})

	it('should render em-dash for undefined value', () => {
		const { container } = render(DisplayValue, { props: { value: undefined } })
		expect(container.querySelector('[data-display-value]').textContent).toBe('—')
	})

	it('should format currency', () => {
		const { container } = render(DisplayValue, {
			props: { value: 1234.5, format: 'currency' }
		})
		const text = container.querySelector('[data-display-value]').textContent
		expect(text).toContain('1,234.50')
		expect(text).toContain('$')
	})

	it('should format number', () => {
		const { container } = render(DisplayValue, {
			props: { value: 9876543, format: 'number' }
		})
		expect(container.querySelector('[data-display-value]').textContent).toContain('9,876,543')
	})

	it('should format boolean true', () => {
		const { container } = render(DisplayValue, {
			props: { value: true, format: 'boolean' }
		})
		expect(container.querySelector('[data-display-value]').textContent).toBe('✓')
	})

	it('should format boolean false', () => {
		const { container } = render(DisplayValue, {
			props: { value: false, format: 'boolean' }
		})
		expect(container.querySelector('[data-display-value]').textContent).toBe('✗')
	})

	it('should format duration in hours and minutes', () => {
		const { container } = render(DisplayValue, {
			props: { value: 125, format: 'duration' }
		})
		expect(container.querySelector('[data-display-value]').textContent).toBe('2h 5m')
	})

	it('should format duration with only hours', () => {
		const { container } = render(DisplayValue, {
			props: { value: 120, format: 'duration' }
		})
		expect(container.querySelector('[data-display-value]').textContent).toBe('2h')
	})

	it('should format duration with only minutes', () => {
		const { container } = render(DisplayValue, {
			props: { value: 45, format: 'duration' }
		})
		expect(container.querySelector('[data-display-value]').textContent).toBe('45m')
	})

	it('should format badge as string', () => {
		const { container } = render(DisplayValue, {
			props: { value: 'active', format: 'badge' }
		})
		const el = container.querySelector('[data-display-value]')
		expect(el.textContent).toBe('active')
		expect(el.getAttribute('data-format')).toBe('badge')
	})

	it('should format datetime', () => {
		const { container } = render(DisplayValue, {
			props: { value: '2024-06-15T10:30:00Z', format: 'datetime' }
		})
		const text = container.querySelector('[data-display-value]').textContent
		// Locale-dependent, but should contain date parts
		expect(text.length).toBeGreaterThan(0)
		expect(text).not.toBe('—')
	})

	it('should set data-format attribute', () => {
		const { container } = render(DisplayValue, {
			props: { value: 42, format: 'number' }
		})
		expect(container.querySelector('[data-display-value]').getAttribute('data-format')).toBe(
			'number'
		)
	})
})
