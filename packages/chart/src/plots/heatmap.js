import {
	isSunday,
	addDays,
	subMonths,
	startOfMonth,
	format,
	previousSunday,
	differenceInDays,
	differenceInWeeks,
	endOfWeek
} from 'date-fns'
import { nest } from 'd3-collection'
import { group } from 'd3-array'

const DATE_FORMAT = 'yyyy-MM-dd'
const weekdays = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']

export function summarize(data, dateField = 'date', valueField) {
	// const summary = group(data, d => d[dateField])
	const nested = nest()
		.key((d) => format(new Date(d[dateField]), DATE_FORMAT))
		.rollup((d) =>
			valueField
				? d.map((value) => value[valueField]).reduce((a, b) => a + b, 0)
				: d.length
		)
		.entries(data)
	// console.log(Object.fromEntries(nested))
	return nested.reduce((obj, item) => ((obj[item.key] = item.value), obj), {})
}

export function heatmap(data, numberOfMonths) {
	const today = new Date()
	const firstDay = getFirstDay(numberOfMonths, today)
	const months = {}
	const grid = generateGrid(firstDay, today).map((d) => ({
		...d,
		value: d.date in data ? data[d.date] : 0
	}))

	grid.map((d) => {
		const month = format(endOfWeek(new Date(d.date)), 'MMM')
		// console.log(month)
		if (!(month in months)) {
			months[month] = d.x
		}
	})
	return {
		grid,
		months,
		weekdays,
		numberOfWeeks: differenceInWeeks(today, firstDay) + 1
	}
}

function getFirstDay(months, lastDay = new Date()) {
	const firstDay = subMonths(startOfMonth(lastDay), months)
	return isSunday(firstDay) ? firstDay : previousSunday(firstDay)
}

function generateGrid(firstDay, lastDay) {
	const days = differenceInDays(lastDay, firstDay) + 1

	const grid = [...Array(days).keys()].map((day) => ({
		x: Math.floor(day / 7),
		y: day % 7,
		date: format(addDays(firstDay, day), DATE_FORMAT)
	}))
	return grid
}
