import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render } from '@testing-library/svelte'
import Rating from './Rating.svelte'

describe('Rating component', () => {
	it('renders the correct number of stars', async () => {
		const { container } = render(Rating, { max: 5 })
		const stars = container.querySelectorAll('icon')
		expect(stars.length).toBe(5)
	})

	it('selects the correct number of stars when value changes', async () => {
		const { container, component } = render(Rating, { value: 3, max: 5 })
		const stars = container.querySelectorAll('icon')
		component.$set({ value: 4 })
		await vi.flush()

		const selectedStars = Array.from(stars).filter(
			(star) => star.getAttribute('aria-checked') === 'true'
		)
		expect(selectedStars.length).toBe(4)
	})

	it('updates value on click when not disabled', async () => {
		const { container } = render(Rating, { value: 2, max: 5 })
		const stars = container.querySelectorAll('icon')

		await fireEvent.click(stars[3])
		expect(container.querySelector('input').value).toBe('4')
	})

	it('does not update value on click when disabled', async () => {
		const { container } = render(Rating, { value: 2, max: 5, disabled: true })
		const stars = container.querySelectorAll('icon')

		await fireEvent.click(stars[3])
		expect(container.querySelector('input').value).toBe('2')
	})

	it('updates value on keyboard arrow key presses', async () => {
		const { container } = render(Rating, { value: 3, max: 5 })
		const rating = container.querySelector('rating')

		await fireEvent.keyDown(rating, { key: 'ArrowLeft' })
		expect(container.querySelector('input').value).toBe('2')

		await fireEvent.keyDown(rating, { key: 'ArrowRight' })
		expect(container.querySelector('input').value).toBe('3')
	})

	it('updates value on keyboard number key presses', async () => {
		const { container } = render(Rating, { value: 3, max: 5 })
		const rating = container.querySelector('rating')

		await fireEvent.keyDown(rating, { code: 'Digit1' })
		expect(container.querySelector('input').value).toBe('1')

		await fireEvent.keyDown(rating, { code: 'Digit5' })
		expect(container.querySelector('input').value).toBe('5')
	})

	it('emits change event with new value on click', async () => {
		const handleChange = vi.fn()
		const { container } = render(Rating, {
			value: 2,
			max: 5,
			on: { change: handleChange }
		})
		const stars = container.querySelectorAll('icon')

		await fireEvent.click(stars[3])
		expect(handleChange).toHaveBeenCalledWith({ detail: { value: 4 } })
	})
})
