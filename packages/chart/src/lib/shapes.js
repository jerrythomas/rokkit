const names = [
	'circle',
	'square',
	'triangle',
	'diamond',
	'star',
	'rhombus',
	'heart'
]
const data = {
	square: ['M', 1, 1, 'L', 9, 1, 'L', 9, 9, 'L', 1, 9, 'Z'],
	circle: [
		['M', 0, 5],
		['A', 5, 5, 0, 0, 0, 10, 5],
		['A', 5, 5, 0, 0, 0, 0, 5]
	],
	triangle: ['M', 5, 0, 'L', 10, 10, 'L', 0, 10, 'Z'],
	diamond: [
		['M', 5, 0],
		['A', 7, 7, 0, 0, 0, 10, 5],
		['A', 7, 7, 0, 0, 0, 5, 10],
		['A', 7, 7, 0, 0, 0, 0, 5],
		['A', 7, 7, 0, 0, 0, 5, 0]
	],
	rhombus: ['M', 0, 5, 'L', 5, 0, 'L', 10, 5, 'L', 5, 10, 'Z'],
	heart: [
		['M', 9, 5],
		['A', 0.8, 0.8, 0, 0, 0, 5, 2],
		['A', 0.8, 0.8, 0, 0, 0, 1, 5],
		['L', 5, 9],
		['L', 9, 5]
	],
	star: [
		['M', 4.80001, 0],
		['L', 5.92258, 3.45491],
		['H', 9.55529],
		['L', 6.61637, 5.59017],
		['L', 7.73894, 9.04509],
		['L', 4.80001, 6.90983],
		['L', 1.86108, 9.04509],
		['L', 2.98365, 5.59017],
		['L', 0.0447266, 3.45491],
		['H', 3.67744],
		['L', 4.80001, 0],
		['Z']
	]
}

function scaledPath(size, x) {
	if (Array.isArray(x)) return x.map((x) => scaledPath(size, x)).join(' ')
	return typeof size === 'number' ? x * size : x
}

export const shapes = names.map((name) => ({
	name,
	path: (s) => scaledPath(s, data[name])
}))

export const namedShapes = {
	square: (s) =>
		`M${0.1 * s} 0` +
		`A${0.1 * s} ${0.1 * s} 0 0 0 0 ${0.1 * s}V${0.9 * s}` +
		`A${0.1 * s} ${0.1 * s} 0 0 0 ${0.1 * s} ${s}H${0.9 * s}` +
		`A${0.1 * s} ${0.1 * s} 0 0 0 ${s} ${0.9 * s}V${0.1 * s}` +
		`A${0.1 * s} ${0.1 * s} 0 0 0 ${0.9 * s} 0Z`,
	circle: (s) =>
		`M0 ${0.5 * s}` +
		`A${0.5 * s} ${0.5 * s} 0 0 0 ${s} ${0.5 * s}` +
		`A${0.5 * s} ${0.5 * s} 0 0 0 0 ${0.5 * s}`,
	diamond: (s) =>
		`M${0.5 * s} 0` +
		`A${0.6 * s} ${0.6 * s} 0 0 0 ${s} ${0.5 * s}` +
		`A${0.6 * s} ${0.6 * s} 0 0 0 ${0.5 * s} ${s}` +
		`A${0.6 * s} ${0.6 * s} 0 0 0 0 ${0.5 * s}` +
		`A${0.6 * s} ${0.6 * s} 0 0 0 ${0.5 * s} 0`,
	triangle: (s) =>
		`M${0.5 * s} ${0.0866 * s}L0 ${0.9234 * s}L${s} ${0.9234 * s}Z`,
	rhombus: (s) =>
		`M${0.5 * s} 0` +
		`L${s} ${0.5 * s}` +
		`L${0.5 * s} ${s}` +
		`L0 ${0.5 * s}Z`,
	star: (s) =>
		`M${0.5 * s} ${0.05 * s}` +
		`L${0.606 * s} ${0.36 * s}` +
		`L${s} ${0.36 * s}` +
		`L${0.685 * s} ${0.59 * s}` +
		`L${0.81 * s} ${0.95 * s}` +
		`L${0.5 * s} ${0.725 * s}` +
		`L${0.19 * s} ${0.95 * s}` +
		`L${0.315 * s} ${0.59 * s}` +
		`L0 ${0.36 * s}` +
		`L${0.394 * s} ${0.36 * s}Z`,
	heart: (s) =>
		`M${0.9 * s} ${0.5 * s}` +
		`A${0.08 * s} ${0.08 * s} 0 0 0 ${0.5 * s} ${0.2 * s}` +
		`A${0.08 * s} ${0.08 * s} 0 0 0 ${0.1 * s} ${0.5 * s}` +
		`L${0.5 * s} ${0.9 * s}` +
		`L${0.9 * s} ${0.5 * s}`,
	shurikan: (s) =>
		`M${0.3 * s} ${0.1 * s}L${0.5 * s} 0L${0.7 * s} ${0.1 * s}` +
		`A ${0.05 * s} ${0.05 * s} 0 0 0 ${0.9 * s} ${0.35 * s}` +
		`L${s} ${0.5 * s}L${0.9 * s} ${0.7 * s}` +
		`A ${0.05 * s} ${0.05 * s} 0 0 0 ${0.7 * s} ${0.9 * s}` +
		`L${0.5 * s} ${s}L${0.3 * s} ${0.9 * s}` +
		`A${0.05 * s} ${0.05 * s} 0 0 0 ${0.1 * s} ${0.7 * s}` +
		`L0 ${0.5 * s}L${0.1 * s} ${0.3 * s}` +
		`A${0.05 * s} ${0.05 * s} 0 0 0 ${0.3 * s} ${0.1 * s}` +
		`M${0.4 * s} ${0.5 * s}` +
		`A${0.1 * s} ${0.1 * s} 0 0 0 ${0.6 * s} ${0.5 * s}` +
		`A${0.1 * s} ${0.1 * s} 0 0 0 ${0.4 * s} ${0.5 * s}`,
	crosshair: (s) =>
		`M${0.2 * s} ${0.5 * s}` +
		`A${0.3 * s} ${0.3 * s} 0 0 0 ${0.8 * s} ${0.5 * s}` +
		`A${0.3 * s} ${0.3 * s} 0 0 0 ${0.2 * s} ${0.5 * s}` +
		`M0 ${0.5 * s}` +
		`L${s} ${0.5 * s}` +
		`M${0.5 * s} 0` +
		`L${0.5 * s} ${s}`,
	crossboats: (s) =>
		`M0 ${0.5 * s}` +
		`A${0.6 * s} ${0.4 * s} 0 0 0 ${s} ${0.5 * s}` +
		`A${0.6 * s} ${0.4 * s} 0 0 0 0 ${0.5 * s}` +
		`M${0.5 * s} 0` +
		`A${0.4 * s} ${0.6 * s} 0 0 0 ${0.5 * s} ${s}` +
		`A${0.4 * s} ${0.6 * s} 0 0 0 ${0.5 * s} 0`,
	curvedrhombus: (s) =>
		`M${0.1 * s} ${0.1 * s}` +
		`A${0.5 * s} ${0.5 * s} 0 0 0 ${0.9 * s} ${0.1 * s}` +
		`A${0.5 * s} ${0.5 * s} 0 0 0 ${0.9 * s} ${0.9 * s}` +
		`A${0.5 * s} ${0.5 * s} 0 0 0 ${0.1 * s} ${0.9 * s}` +
		`A${0.5 * s} ${0.5 * s} 0 0 0 ${0.1 * s} ${0.1 * s}`,
	fourflags: (s) =>
		`M${0.5 * s} ${0.3 * s}` +
		`A${0.2 * s} ${0.1 * s} 0 0 0 ${0.5 * s} ${0.1 * s}` +
		`L${0.5 * s} ${0.9 * s}` +
		`M${0.5 * s} ${0.7 * s}` +
		`A${0.2 * s} ${0.1 * s} 0 0 0 ${0.5 * s} ${0.9 * s}` +
		`M${0.3 * s} ${0.5 * s}` +
		`A${0.1 * s} ${0.2 * s} 0 0 0 ${0.1 * s} ${0.5 * s}` +
		`L${0.9 * s} ${0.5 * s}` +
		`M${0.7 * s} ${0.5 * s}` +
		`A${0.1 * s} ${0.2 * s} 0 0 0 ${0.9 * s} ${0.5 * s}`
}
