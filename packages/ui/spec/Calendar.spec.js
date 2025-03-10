import { describe, expect, it, beforeEach } from 'vitest'
import { cleanup, fireEvent, render } from '@testing-library/svelte'
import { tick } from 'svelte'
import Calendar from '../src/Calendar.svelte'
import { getDaysInMonth, getDate } from 'date-fns'

describe('Calendar.svelte', () => {
	beforeEach(() => cleanup())
	it('should render a calendar', () => {
		const { container } = render(Calendar, { props: { fixed: false } })
		const today = new Date()
		const count = getDaysInMonth(today)

		expect(container).toBeTruthy()
		const days = container.querySelectorAll('day-of-month')
		const index = getDate(today)
		expect(days.length).toEqual(count)

		days.forEach((day, i) => {
			expect(day.getAttribute('aria-selected')).toEqual(i === index - 1 ? 'true' : 'false')
		})
	})

	it('should render a calendar for specific date', () => {
		const { container } = render(Calendar, { props: { value: new Date('10-Jun-2023') } })
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})

	it('should render a calendar with holidays', () => {
		const { container } = render(Calendar, {
			props: {
				value: new Date('12-Feb-2023'),
				holidays: [new Date('14-Feb-2023')]
			}
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})

	it('should render a calendar with non fixed rows', () => {
		const { container } = render(Calendar, {
			props: {
				value: new Date('11-Jun-2023'),
				fixed: false
			}
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})

	it('should change value when clicking on a date', async () => {
		const { container } = render(Calendar, {
			props: {
				value: new Date('11-Jun-2023'),
				fixed: false
			}
		})

		const days = container.querySelectorAll('day-of-month')
		await fireEvent.click(days[15])
		await tick()
		expect(container).toMatchSnapshot()
	})

	it('should change value when year is changed', async () => {
		const { container } = render(Calendar, {
			props: {
				value: new Date('11-Jun-2023'),
				fixed: false
			}
		})

		const year = container.querySelector('input[type="number"]')
		year.value = '2024'
		await fireEvent.change(year)
		await tick()
		expect(container).toMatchSnapshot()
	})

	// it('should render a calendar with value changes', async () => {
	// 	const { container, component } = render(Calendar)

	// 	setProperties(component, { value: new Date('11-Jun-2023') })
	// 	await tick()
	// 	expect(container).toMatchSnapshot()
	// })
})
