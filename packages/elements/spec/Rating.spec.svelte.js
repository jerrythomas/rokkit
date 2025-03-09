import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render } from '@testing-library/svelte'
import { flushSync, tick } from 'svelte'
import Rating from '../src/Rating.svelte'

describe('Rating component', () => {
	const ROOT = 'rk-rating'
	const ICON = 'rk-icon'

	function getSelectedStars(container) {
		const stars = container.querySelectorAll(ICON)
		const selectedStars = Array.from(stars).filter(
			(star) => star.getAttribute('aria-checked') === 'true'
		)
		return selectedStars.length
	}

	it('should render the correct number of stars', () => {
		const props = $state({ max: 5 })
		const { container } = render(Rating, { props })
		expect(container).toMatchSnapshot()
		const stars = container.querySelectorAll(ICON)
		expect(stars.length).toBe(5)
	})

	it('should select the correct number of stars when value changes', async () => {
		const props = $state({ value: 3, max: 5 })
		const { container } = render(Rating, { props })

		expect(container).toMatchSnapshot()
		expect(getSelectedStars(container)).toBe(3)

		props.value = 4
		flushSync()
		await tick()
		expect(container).toMatchSnapshot()
		expect(getSelectedStars(container)).toBe(4)
	})

	it('should update value on click when not disabled', async () => {
		const props = $state({ value: 2, max: 5, name: 'rating' })
		const { container } = render(Rating, { props })

		const stars = container.querySelectorAll(ICON)
		await fireEvent.click(stars[3])
		await tick()

		expect(container).toMatchSnapshot()
		expect(getSelectedStars(container)).toBe(4)
		expect(container.querySelector('input').value).toBe('4')
	})

	it('should reset the value to zero', async () => {
		const props = $state({
			value: 1,
			max: 5,
			name: 'rating'
		})
		const { container } = render(Rating, { props })
		const stars = container.querySelectorAll(ICON)

		await fireEvent.click(stars[0])
		await tick()

		expect(props.value).toBe(0)
		expect(container).toMatchSnapshot()
		expect(getSelectedStars(container)).toBe(0)
		expect(container.querySelector('input').value).toBe('0')
	})

	it('should not update value on click when disabled', async () => {
		const props = $state({
			value: 2,
			max: 5,
			disabled: true,
			name: 'rating'
		})
		const { container } = render(Rating, { props })
		const stars = container.querySelectorAll(ICON)

		await fireEvent.click(stars[3])
		expect(container.querySelector('input').value).toBe('2')
	})

	it('should update value on keyboard arrow key presses', async () => {
		const props = $state({ value: 3, max: 5, name: 'rating' })
		const { container } = render(Rating, { props })
		const rating = container.querySelector(ROOT)

		await fireEvent.keyDown(rating, { key: 'ArrowLeft' })
		expect(container.querySelector('input').value).toBe('2')

		await fireEvent.keyDown(rating, { key: 'ArrowRight' })
		expect(container.querySelector('input').value).toBe('3')
	})

	it('should update value on keyboard number key presses', async () => {
		const props = $state({ value: 3, max: 5, name: 'rating' })
		const { container } = render(Rating, { props })
		const rating = container.querySelector(ROOT)

		await fireEvent.keyDown(rating, { code: 'Digit1' })
		expect(container.querySelector('input').value).toBe('1')

		await fireEvent.keyDown(rating, { code: 'Digit5' })
		expect(container.querySelector('input').value).toBe('5')
	})

	it('should emit change event with new value on click', async () => {
		const props = $state({
			value: 2,
			max: 5,
			onchange: vi.fn()
		})
		const { container } = render(Rating, {
			props
		})

		const stars = container.querySelectorAll(ICON)

		await fireEvent.click(stars[3])
		expect(props.onchange).toHaveBeenCalledWith({ value: 4 })
	})

	it('should handle mouseenter and mouseleave events', async () => {
		const props = $state({ value: 2, max: 5 })
		const { container } = render(Rating, { props })
		const stars = container.querySelectorAll(ICON)

		await fireEvent.mouseEnter(stars[props.value + 1])
		await tick()
		for (let i = 0; i < props.max; i++) {
			if (i <= props.value + 1) expect(Array.from(stars[i].classList)).toContain('hovering')
			else expect(Array.from(stars[i].classList)).not.toContain('hovering')
		}
		expect(container).toMatchSnapshot()
	})

	it('should not handle mouseenter and mouseleave events when disabled', async () => {
		const props = $state({ value: 2, max: 5, disabled: true })
		const { container } = render(Rating, { props })
		const stars = container.querySelectorAll(ICON)

		await fireEvent.mouseEnter(stars[3])
		await tick()
		for (let i = 0; i < 5; i++) {
			expect(Array.from(stars[i].classList)).not.toContain('hovering')
		}
		expect(container).toMatchSnapshot()
	})
})
