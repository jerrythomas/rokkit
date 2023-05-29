// import { writable } from 'svelte/store'
import { tweened, cubicOut } from 'svelte/motion'
// function createChart() {
// 	const { subscribe, set } = writable({
// 		data: [],
// 		x: '',
// 		y: ''
// 	})
// 	return { subscribe, set }
// }

export function animatedChart(input, key, valueFields = [], previous = []) {
	const previousKeys = new Set(previous.map((item) => item[key]))
	const currentKeys = new Set(input.map((item) => item[key]))
	const toAdd = new Set(
		[...currentKeys].filter((key) => !previousKeys.has(key))
	)
	const toRemove = new Set(
		[...previousKeys].filter((key) => !currentKeys.has(key))
	)
	console.log(toAdd, toRemove)
	let data = input
		.filter((item) => toAdd.has(item[key]))
		.map((item) => {
			let el = { ...item }
			valueFields.forEach(
				({ field, initialValue, attrs }) =>
					(el[field] =
						typeof initialValue === 'function'
							? initialValue(el, attrs)
							: initialValue)
			)
			return el
		})
	let prev = previous
		.filter((item) => !toRemove.has(item[key]))
		.map((item) => {
			let el = { ...item }
			valueFields.forEach(
				({ field, initialValue, attrs }) =>
					(el[field] =
						typeof initialValue === 'function'
							? initialValue(el, { ...attrs, isPrevious: true })
							: initialValue)
			)
			return el
		})
	data = [...prev, ...data]
	console.log(data)
	return tweened(data, { duration: 500, easing: cubicOut })
}
// function createAxis() {
// 	const { subscribe, set } = writable({})

// 	let data
// 	let x = {}
// 	let y = {}

// 	// find origin & orientation
// 	function getOriginAndOrientation(data, x, y) {
// 		this.data = data
// 		this.x = x
// 		this.y = y
// 	}
// 	function init(config, data) {}
// 	return { subscribe, init, set, getOriginAndOrientation }
// }

// export const chart = createChart()
// export const axis = createAxis()
