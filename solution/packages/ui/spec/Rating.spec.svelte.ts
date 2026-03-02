import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import Rating from '../src/components/Rating.svelte'

describe('Rating', () => {
	// ─── Rendering ──────────────────────────────────────────────────

	it('renders a rating container', () => {
		const { container } = render(Rating)
		expect(container.querySelector('[data-rating]')).toBeTruthy()
	})

	it('renders 5 stars by default', () => {
		const { container } = render(Rating)
		const items = container.querySelectorAll('[data-rating-item]')
		expect(items.length).toBe(5)
	})

	it('renders custom number of stars', () => {
		const { container } = render(Rating, { max: 10 })
		const items = container.querySelectorAll('[data-rating-item]')
		expect(items.length).toBe(10)
	})

	it('has role="radiogroup"', () => {
		const { container } = render(Rating)
		const el = container.querySelector('[data-rating]')
		expect(el?.getAttribute('role')).toBe('radiogroup')
	})

	it('has aria-label', () => {
		const { container } = render(Rating)
		const el = container.querySelector('[data-rating]')
		expect(el?.getAttribute('aria-label')).toBe('Rating')
	})

	// ─── Value Display ──────────────────────────────────────────────

	it('marks correct stars as filled', () => {
		const { container } = render(Rating, { value: 3 })
		const items = container.querySelectorAll('[data-rating-item]')
		expect(items[0]?.hasAttribute('data-filled')).toBe(true)
		expect(items[1]?.hasAttribute('data-filled')).toBe(true)
		expect(items[2]?.hasAttribute('data-filled')).toBe(true)
		expect(items[3]?.hasAttribute('data-filled')).toBe(false)
		expect(items[4]?.hasAttribute('data-filled')).toBe(false)
	})

	it('no stars filled when value is 0', () => {
		const { container } = render(Rating, { value: 0 })
		const filled = container.querySelectorAll('[data-rating-item][data-filled]')
		expect(filled.length).toBe(0)
	})

	// ─── Click Interaction ──────────────────────────────────────────

	it('clicking a star sets the value', async () => {
		const onchange = vi.fn()
		const { container } = render(Rating, { value: 0, onchange })
		const items = container.querySelectorAll('[data-rating-item]')
		await fireEvent.click(items[2])
		expect(onchange).toHaveBeenCalledWith(3)
	})

	it('clicking the same star toggles to 0', async () => {
		const onchange = vi.fn()
		const { container } = render(Rating, { value: 3, onchange })
		const items = container.querySelectorAll('[data-rating-item]')
		await fireEvent.click(items[2])
		expect(onchange).toHaveBeenCalledWith(0)
	})

	it('does not respond to clicks when disabled', async () => {
		const onchange = vi.fn()
		const { container } = render(Rating, { value: 2, disabled: true, onchange })
		const items = container.querySelectorAll('[data-rating-item]')
		await fireEvent.click(items[3])
		expect(onchange).not.toHaveBeenCalled()
	})

	// ─── Keyboard Navigation ────────────────────────────────────────

	it('ArrowRight increases value', async () => {
		const onchange = vi.fn()
		const { container } = render(Rating, { value: 2, onchange })
		const el = container.querySelector('[data-rating]')!
		await fireEvent.keyDown(el, { key: 'ArrowRight' })
		expect(onchange).toHaveBeenCalledWith(3)
	})

	it('ArrowLeft decreases value', async () => {
		const onchange = vi.fn()
		const { container } = render(Rating, { value: 3, onchange })
		const el = container.querySelector('[data-rating]')!
		await fireEvent.keyDown(el, { key: 'ArrowLeft' })
		expect(onchange).toHaveBeenCalledWith(2)
	})

	it('ArrowUp increases value', async () => {
		const onchange = vi.fn()
		const { container } = render(Rating, { value: 1, onchange })
		const el = container.querySelector('[data-rating]')!
		await fireEvent.keyDown(el, { key: 'ArrowUp' })
		expect(onchange).toHaveBeenCalledWith(2)
	})

	it('ArrowDown decreases value', async () => {
		const onchange = vi.fn()
		const { container } = render(Rating, { value: 2, onchange })
		const el = container.querySelector('[data-rating]')!
		await fireEvent.keyDown(el, { key: 'ArrowDown' })
		expect(onchange).toHaveBeenCalledWith(1)
	})

	it('does not exceed max', async () => {
		const onchange = vi.fn()
		const { container } = render(Rating, { value: 5, max: 5, onchange })
		const el = container.querySelector('[data-rating]')!
		await fireEvent.keyDown(el, { key: 'ArrowRight' })
		expect(onchange).toHaveBeenCalledWith(5)
	})

	it('does not go below 0', async () => {
		const onchange = vi.fn()
		const { container } = render(Rating, { value: 0, onchange })
		const el = container.querySelector('[data-rating]')!
		await fireEvent.keyDown(el, { key: 'ArrowLeft' })
		expect(onchange).toHaveBeenCalledWith(0)
	})

	it('digit keys set value directly', async () => {
		const onchange = vi.fn()
		const { container } = render(Rating, { value: 0, onchange })
		const el = container.querySelector('[data-rating]')!
		await fireEvent.keyDown(el, { key: '4' })
		expect(onchange).toHaveBeenCalledWith(4)
	})

	it('ignores digit keys above max', async () => {
		const onchange = vi.fn()
		const { container } = render(Rating, { value: 0, max: 3, onchange })
		const el = container.querySelector('[data-rating]')!
		await fireEvent.keyDown(el, { key: '5' })
		expect(onchange).not.toHaveBeenCalled()
	})

	it('does not respond to keys when disabled', async () => {
		const onchange = vi.fn()
		const { container } = render(Rating, { value: 2, disabled: true, onchange })
		const el = container.querySelector('[data-rating]')!
		await fireEvent.keyDown(el, { key: 'ArrowRight' })
		expect(onchange).not.toHaveBeenCalled()
	})

	// ─── Disabled State ─────────────────────────────────────────────

	it('sets data-rating-disabled when disabled', () => {
		const { container } = render(Rating, { disabled: true })
		expect(container.querySelector('[data-rating-disabled]')).toBeTruthy()
	})

	it('is not focusable when disabled', () => {
		const { container } = render(Rating, { disabled: true })
		const el = container.querySelector('[data-rating]') as HTMLElement
		expect(el?.getAttribute('tabindex')).toBeNull()
	})

	it('is focusable when not disabled', () => {
		const { container } = render(Rating)
		const el = container.querySelector('[data-rating]') as HTMLElement
		expect(el?.tabIndex).toBe(0)
	})

	// ─── Icons ──────────────────────────────────────────────────────

	it('renders default semantic rating-filled icon for filled stars', () => {
		const { container } = render(Rating, { value: 1 })
		const icon = container.querySelector('[data-rating-item][data-filled] [data-rating-icon]')
		expect(icon).toBeTruthy()
		expect(icon?.classList.contains('rating-filled')).toBe(true)
	})

	it('renders default semantic rating-empty icon for empty stars', () => {
		const { container } = render(Rating, { value: 1, max: 2 })
		const items = container.querySelectorAll('[data-rating-item]')
		const emptyIcon = items[1]?.querySelector('[data-rating-icon]')
		expect(emptyIcon).toBeTruthy()
		expect(emptyIcon?.classList.contains('rating-empty')).toBe(true)
	})

	it('uses custom icons override', () => {
		const { container } = render(Rating, { value: 1, max: 2, icons: { filled: 'custom-star-filled', empty: 'custom-star-empty' } })
		const items = container.querySelectorAll('[data-rating-item]')
		const filledIcon = items[0]?.querySelector('[data-rating-icon]')
		const emptyIcon = items[1]?.querySelector('[data-rating-icon]')
		expect(filledIcon?.classList.contains('custom-star-filled')).toBe(true)
		expect(emptyIcon?.classList.contains('custom-star-empty')).toBe(true)
	})

	// ─── Custom Class ───────────────────────────────────────────────

	it('applies custom class', () => {
		const { container } = render(Rating, { class: 'my-rating' })
		const el = container.querySelector('[data-rating]')
		expect(el?.classList.contains('my-rating')).toBe(true)
	})

	// ─── ARIA ───────────────────────────────────────────────────────

	it('stars have role="radio"', () => {
		const { container } = render(Rating)
		const item = container.querySelector('[data-rating-item]')
		expect(item?.getAttribute('role')).toBe('radio')
	})

	it('filled stars have aria-checked=true', () => {
		const { container } = render(Rating, { value: 2 })
		const items = container.querySelectorAll('[data-rating-item]')
		expect(items[0]?.getAttribute('aria-checked')).toBe('true')
		expect(items[1]?.getAttribute('aria-checked')).toBe('true')
		expect(items[2]?.getAttribute('aria-checked')).toBe('false')
	})

	it('stars have aria-label', () => {
		const { container } = render(Rating, { max: 5 })
		const items = container.querySelectorAll('[data-rating-item]')
		expect(items[0]?.getAttribute('aria-label')).toBe('Rate 1 of 5')
		expect(items[4]?.getAttribute('aria-label')).toBe('Rate 5 of 5')
	})

	// ─── Translatable Labels ────────────────────────────────────────

	it('uses default label from MessagesStore', () => {
		const { container } = render(Rating)
		const el = container.querySelector('[data-rating]')
		expect(el?.getAttribute('aria-label')).toBe('Rating')
	})

	it('allows custom label prop to override default', () => {
		const { container } = render(Rating, { label: 'Bewertung' })
		const el = container.querySelector('[data-rating]')
		expect(el?.getAttribute('aria-label')).toBe('Bewertung')
	})
})
