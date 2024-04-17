import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render } from '@testing-library/svelte'
import { getPropertyValue, toHaveBeenDispatchedWith } from 'validators'
import { tick } from 'svelte'
import Rating from '../../src/input/Rating.svelte'

expect.extend({ toHaveBeenDispatchedWith })

describe('Rating component', () => {
	it('should render the correct number of stars', () => {
		const { container } = render(Rating, { max: 5 })
		expect(container).toMatchSnapshot()
		const stars = container.querySelectorAll('icon')
		expect(stars.length).toBe(5)
	})

	it('should select the correct number of stars when value changes', async () => {
		const { container, component } = render(Rating, { value: 3, max: 5 })
		const stars = container.querySelectorAll('icon')
		component.$set({ value: 4 })
		await tick()
		expect(container).toMatchSnapshot()
		const selectedStars = Array.from(stars).filter(
			(star) => star.getAttribute('aria-checked') === 'true'
		)
		expect(selectedStars.length).toBe(4)
	})

	it('should update value on click when not disabled', async () => {
		const { container } = render(Rating, { value: 2, max: 5, name: 'rating' })
		const stars = container.querySelectorAll('icon')

		await fireEvent.click(stars[3])
		await tick()
		const selectedStars = Array.from(stars).filter(
			(star) => star.getAttribute('aria-checked') === 'true'
		)
		expect(container).toMatchSnapshot()
		expect(selectedStars.length).toBe(4)
		expect(container.querySelector('input').value).toBe('4')
	})

	it('should reset the value to zero', async () => {
		const { container, component } = render(Rating, {
			value: 1,
			max: 5,
			name: 'rating'
		})
		const stars = container.querySelectorAll('icon')

		await fireEvent.click(stars[0])
		await tick()
		expect(getPropertyValue(component, 'value')).toBe(0)
		const selectedStars = Array.from(stars).filter(
			(star) => star.getAttribute('aria-checked') === 'true'
		)
		expect(container).toMatchSnapshot()
		expect(selectedStars.length).toBe(0)
		expect(container.querySelector('input').value).toBe('0')
	})

	it('should not update value on click when disabled', async () => {
		const { container } = render(Rating, {
			value: 2,
			max: 5,
			disabled: true,
			name: 'rating'
		})
		const stars = container.querySelectorAll('icon')

		await fireEvent.click(stars[3])
		expect(container.querySelector('input').value).toBe('2')
	})

	it('should update value on keyboard arrow key presses', async () => {
		const { container } = render(Rating, { value: 3, max: 5, name: 'rating' })
		const rating = container.querySelector('rating')

		await fireEvent.keyDown(rating, { key: 'ArrowLeft' })
		expect(container.querySelector('input').value).toBe('2')

		await fireEvent.keyDown(rating, { key: 'ArrowRight' })
		expect(container.querySelector('input').value).toBe('3')
	})

	it('should update value on keyboard number key presses', async () => {
		const { container } = render(Rating, { value: 3, max: 5, name: 'rating' })
		const rating = container.querySelector('rating')

		await fireEvent.keyDown(rating, { code: 'Digit1' })
		expect(container.querySelector('input').value).toBe('1')

		await fireEvent.keyDown(rating, { code: 'Digit5' })
		expect(container.querySelector('input').value).toBe('5')
	})

	it('should emit change event with new value on click', async () => {
		const handleChange = vi.fn()
		const { component, container } = render(Rating, {
			value: 2,
			max: 5
		})
		component.$on('change', handleChange)
		const stars = container.querySelectorAll('icon')

		await fireEvent.click(stars[3])
		expect(handleChange).toHaveBeenDispatchedWith({ value: 4 })
	})

	it('should handle mouseenter and mouseleave events', async () => {
		const max = 5
		const value = 2
		const { container } = render(Rating, { value, max })
		const stars = container.querySelectorAll('icon')

		await fireEvent.mouseEnter(stars[value + 1])
		await tick()
		for (let i = 0; i < max; i++) {
			if (i <= value + 1) expect(Array.from(stars[i].classList)).toContain('hovering')
			else expect(Array.from(stars[i].classList)).not.toContain('hovering')
		}
		expect(container).toMatchSnapshot()
	})

	it('should not handle mouseenter and mouseleave events when disabled', async () => {
		const { container } = render(Rating, { value: 2, max: 5, disabled: true })
		const stars = container.querySelectorAll('icon')

		await fireEvent.mouseEnter(stars[3])
		await tick()
		for (let i = 0; i < 5; i++) {
			expect(Array.from(stars[i].classList)).not.toContain('hovering')
		}
		expect(container).toMatchSnapshot()
	})
})
