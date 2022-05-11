export function axis(scale, format) {
	const origin = {
		x: scale.x.ticks
			? scale.x(Math.max(0, Math.min(...scale.x.domain())))
			: scale.x.range()[0],
		y: scale.y.ticks
			? scale.y(Math.max(0, Math.min(...scale.y.domain())))
			: scale.y.range()[0]
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
		let diff = scale.domain().length - count
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
