// Deterministic sample datasets for the chart explorer (no RNG — stable across renders).
// Each dataset is shaped for the chart types that consume it (see registry.ts).

/** Quarterly revenue across two products — Bar / Line / Area. */
export const productSeries = [
	{ quarter: 'Q1', product: 'Pro', revenue: 80 },
	{ quarter: 'Q2', product: 'Pro', revenue: 120 },
	{ quarter: 'Q3', product: 'Pro', revenue: 110 },
	{ quarter: 'Q4', product: 'Pro', revenue: 165 },
	{ quarter: 'Q1', product: 'Lite', revenue: 40 },
	{ quarter: 'Q2', product: 'Lite', revenue: 60 },
	{ quarter: 'Q3', product: 'Lite', revenue: 50 },
	{ quarter: 'Q4', product: 'Lite', revenue: 45 }
]

/** Market share by segment — Pie. */
export const segments = [
	{ segment: 'Mobile', share: 42 },
	{ segment: 'Desktop', share: 35 },
	{ segment: 'Tablet', share: 15 },
	{ segment: 'Smart TV', share: 5 },
	{ segment: 'Other', share: 3 }
]

/** Engine size vs efficiency by car class — Scatter / Bubble / Box / Violin. */
export const cars = [
	{ class: 'compact', drv: 'f', displ: 1.4, cty: 28, hwy: 35 },
	{ class: 'compact', drv: 'f', displ: 1.8, cty: 24, hwy: 31 },
	{ class: 'compact', drv: 'r', displ: 2.0, cty: 22, hwy: 29 },
	{ class: 'midsize', drv: 'f', displ: 2.0, cty: 22, hwy: 30 },
	{ class: 'midsize', drv: '4', displ: 2.5, cty: 19, hwy: 26 },
	{ class: 'midsize', drv: '4', displ: 3.0, cty: 17, hwy: 25 },
	{ class: 'suv', drv: '4', displ: 3.5, cty: 16, hwy: 22 },
	{ class: 'suv', drv: 'r', displ: 4.6, cty: 13, hwy: 18 },
	{ class: 'pickup', drv: '4', displ: 5.0, cty: 12, hwy: 17 },
	{ class: 'pickup', drv: '4', displ: 5.7, cty: 11, hwy: 16 },
	{ class: 'subcompact', drv: 'f', displ: 1.4, cty: 30, hwy: 38 },
	{ class: 'subcompact', drv: 'r', displ: 2.0, cty: 22, hwy: 28 }
]

/** 30-day daily metric (rising with wobble) — Line / Area / Rule reference. */
export const daily = Array.from({ length: 30 }, (_, i) => ({
	day: i - 29,
	value: Math.round(40 + i * 1.6 + 8 * Math.sin(i / 2))
}))

/** Activity matrix: weekday × hour bucket → count — Heatmap. */
export const heatmap = (() => {
	const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
	const hours = ['9a', '12p', '3p', '6p']
	const out: { day: string; hour: string; count: number }[] = []
	days.forEach((day, di) =>
		hours.forEach((hour, hi) => out.push({ day, hour, count: Math.round(20 + 30 * Math.abs(Math.sin(di + hi)) ) }))
	)
	return out
})()

/** Dense 2-D point cloud (two correlated blobs) — Hexbin. */
export const points = Array.from({ length: 120 }, (_, i) => ({
	x: Math.round(50 + 25 * Math.sin(i) + (i % 7) * 3),
	y: Math.round(50 + 25 * Math.cos(i) + (i % 5) * 4)
}))

/** OHLC candles over 12 sessions — Candlestick. */
export const ohlc = Array.from({ length: 12 }, (_, i) => {
	const open = 100 + Math.round(10 * Math.sin(i / 2))
	const close = open + Math.round(6 * Math.cos(i))
	const high = Math.max(open, close) + 4
	const low = Math.min(open, close) - 4
	return { day: `D${i + 1}`, open, high, low, close }
})

/** Sequential deltas with a running total — Waterfall. */
export const waterfall = [
	{ step: 'Start', delta: 100, total: false },
	{ step: 'Sales', delta: 60, total: false },
	{ step: 'Refunds', delta: -25, total: false },
	{ step: 'Fees', delta: -15, total: false },
	{ step: 'Net', delta: 0, total: true }
]

/** Flows between source and target categories — Ribbon (Sankey). */
export const flows = [
	{ source: 'Search', target: 'Signup', value: 40 },
	{ source: 'Search', target: 'Bounce', value: 25 },
	{ source: 'Social', target: 'Signup', value: 20 },
	{ source: 'Social', target: 'Bounce', value: 15 }
]

export const datasets = {
	productSeries,
	segments,
	cars,
	daily,
	heatmap,
	points,
	ohlc,
	waterfall,
	flows
}
export type DatasetKey = keyof typeof datasets
