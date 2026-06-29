import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import Divider from '../src/components/Divider.svelte'

describe('Divider', () => {
	it('renders a separator with horizontal orientation by default', () => {
		const { container } = render(Divider)
		const el = container.querySelector('[data-divider]')
		expect(el).toBeTruthy()
		expect(el?.getAttribute('role')).toBe('separator')
		expect(el?.getAttribute('data-orientation')).toBe('horizontal')
		expect(el?.getAttribute('aria-orientation')).toBe('horizontal')
	})

	it('reflects a vertical orientation', () => {
		const { container } = render(Divider, { orientation: 'vertical' })
		const el = container.querySelector('[data-divider]')
		expect(el?.getAttribute('data-orientation')).toBe('vertical')
		expect(el?.getAttribute('aria-orientation')).toBe('vertical')
	})

	it('renders a label when provided', () => {
		const { container } = render(Divider, { label: 'OR' })
		const label = container.querySelector('[data-divider-label]')
		expect(label?.textContent).toBe('OR')
	})

	it('omits the label element when no label is given', () => {
		const { container } = render(Divider)
		expect(container.querySelector('[data-divider-label]')).toBeNull()
	})

	it('applies a custom class to the root', () => {
		const { container } = render(Divider, { class: 'my-divider' })
		expect(container.querySelector('[data-divider]')?.classList.contains('my-divider')).toBe(true)
	})
})
