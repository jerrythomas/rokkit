import { describe, expect, it, beforeEach } from 'vitest'
import { cleanup, render, fireEvent } from '@testing-library/svelte'
import { tick } from 'svelte'
import { toIncludeAll } from 'validators'
import ProgressDots from '../src/ProgressDots.svelte'

expect.extend({ toIncludeAll })

describe('ProgressDots.svelte', () => {
	beforeEach(() => cleanup())

	it('should render steps as dots', () => {
		const { container } = render(ProgressDots, {
			count: 5
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()

		const wrapper = container.querySelector('.progress')
		expect(wrapper).toBeTruthy()

		expect(wrapper.classList.contains('flex')).toBeTruthy()
		expect(wrapper.classList.contains('items-center')).toBeTruthy()
		expect(wrapper.classList.contains('empty')).toBeFalsy()

		const dots = wrapper.querySelectorAll('.step')
		validateDots(dots, 5, -1, -1)
	})

	it('should render line when empty', () => {
		const { container } = render(ProgressDots, { count: 0 })
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()

		const wrapper = container.querySelector('.progress')
		expect(wrapper).toBeTruthy()

		expect(wrapper.classList.contains('flex')).toBeTruthy()
		expect(wrapper.classList.contains('items-center')).toBeTruthy()
		expect(wrapper.classList.contains('empty')).toBeTruthy()
		expect(wrapper.querySelectorAll('.step').length).toBe(0)
	})

	it('should allow clicking first item only', async () => {
		const { container } = render(ProgressDots, {
			count: 5,
			value: -1,
			current: -1
		})
		const dots = Array.from(container.querySelectorAll('.step'))
		// validateDots(dots, 5, -1, -1)

		dots.slice(1).forEach(async (d) => {
			await fireEvent.click(d)
			await tick()
			validateDots(dots, 5, -1, -1)
		})

		await fireEvent.click(dots[0])
		await tick()
		expect(container).toMatchSnapshot()
		// validateDots(dots, 5, -1, 0)
	})

	it.each([
		[3, 1, -1],
		[3, 1, 1]
	])('should render properly for count %i, value %i, current %i', (count, value, current) => {
		const { container } = render(ProgressDots, {
			count,
			value,
			current
		})
		const dots = container.querySelectorAll('.step')
		validateDots(dots, count, value, current)
	})

	it('should have one active dot', () => {
		const { container } = render(ProgressDots, {
			count: 3,
			value: 1,
			current: 1
		})
		const dots = container.querySelectorAll('.step')
		validateDots(dots, 3, 1, 1)
	})
})

function validateDots(dots, count, value, current) {
	expect(dots.length).toEqual(count)

	dots.forEach((d, i) => {
		expect(Array.from(d.classList)).toIncludeAll(['flex', 'w-3', 'h-3', 'rounded-full'])
		expect({ ...d.dataset }).toEqual(expectedDataset(i, value, current))
	})
}

function expectedDataset(index, value, current) {
	const inprogress = current === value + 1 ? current : -1
	return {
		step: index.toString(),
		active: (index === current).toString(),
		completed: (index <= value).toString(),
		clickable: (index <= value || index <= inprogress).toString()
	}
}
