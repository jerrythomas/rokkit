function getOrigin(scale, axis) {
	const origin = scale[axis].ticks
		? scale(Math.max(0, Math.min(...scale[axis].domain())))
		: scale[axis].range()[0]
	return origin
}
export function axis(scale) {
	const origin = {
		x: getOrigin(scale, 'x'),
		y: getOrigin(scale, 'y')
	}
	const ticks = {
		x: axisTicks(scale.x, { axis: 'x', origin }),
		y: axisTicks(scale.y, { axis: 'y', origin })
	}
	return { origin, ticks }
}

export function axisTicks(scale, opts) {
	let [minRange, maxRange] = scale.range()
	let count = Math.abs((maxRange - minRange) / 40)
	let ticks = scale.domain()
	let offset = 0
	let { axis, format, origin } = {
		axis: 'x',
		format: (x) => x,
		origin: { x: 0, y: 0 },
		...opts
	}
	if (scale.ticks) {
		ticks = scale.ticks(count)
	} else {
		offset = Math.sign(maxRange - minRange) * (scale.bandwidth() / 2)
		count = Math.min(Math.round(count), scale.domain().length)
		if (count < scale.domain().length) {
			let diff = scale.domain().length - count
			ticks = ticks.filter((d, i) => i % diff == 0)
		}
		// let diff = scale.domain().length - count
	}
	ticks = ticks
		.map((t) => ({
			label: format(t),
			pos: scale(t)
		}))
		.map(({ label, pos }) => ({
			label,
			offset: { x: axis === 'x' ? offset : 0, y: axis === 'y' ? offset : 0 },
			x: axis === 'x' ? pos : origin.x,
			y: axis === 'y' ? pos : origin.y
		}))

	return ticks
}

export class Axis {
	constructor(name, chart, offset) {
		this.name = ['x', 'y'].includes(name) ? name : 'x'
		this.chart = chart
		this.offset = offset
	}

	set offset(value) {
		const [min, max] = this.chart.scale[this.name].range()
		const otherAxis = this.name === 'x' ? 'y' : 'x'
		const origin = this.chart.origin[otherAxis]

		this.offset = value * (origin == min ? 1 : origin == max ? -1 : 0)
	}

	// get domain() {
	// 	let coords =
	// 		(coords[axis + '1'] =
	// 		coords[axis + '2'] =
	// 			origin[axis] - offset[axis])
	// }
}
