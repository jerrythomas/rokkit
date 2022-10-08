import {
	getDay,
	getMonth,
	getYear,
	getDaysInMonth,
	format,
	isWeekend
} from 'date-fns'

export const weekdays = [
	'Sunday',
	'Monday',
	'Tuesday',
	'Wednesday',
	'Thursday',
	'Friday',
	'Saturday'
]

export function getCalendarDays(value, holidays = []) {
	const month = getMonth(value)
	const year = getYear(value)
	const offset = getDay(new Date(year, month, 1)) + 1

	const days = Array.from({ length: getDaysInMonth(value) }, (_, i) => ({
		day: i + 1,
		offset: i == 0 ? offset : 0,
		date: new Date(year, month, i + 1)
	})).map((x) => ({
		...x,
		weekend: isWeekend(x.date),
		holiday: holidays.includes(format(x.day, 'yyyy-MMM-dd'))
	}))

	return days
}
