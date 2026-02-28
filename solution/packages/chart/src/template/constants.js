export const library = {
	Brick: {
		component: 'Lines',
		allowed: ['stroke'],
		data: [
			{ x1: 0, y1: 0.25, x2: 0.5, y2: 0.25 },
			{ x1: 0.5, y1: 0.75, x2: 1, y2: 0.75 },
			{ x1: 0, y1: 0, x2: 0, y2: 1 },
			{ x1: 1, y1: 0, x2: 1, y2: 1 },
			{ x1: 0.5, y1: 0, x2: 0.5, y2: 1 }
		]
	},
	Circles: {
		component: 'Circles',
		allowed: ['fill', 'stroke'],
		data: [
			{ cx: 0, cy: 0, r: 0.5 },
			{ cx: 1, cy: 1, r: 0.5 }
		]
	},
	Dominoes: {
		component: 'Circles',
		allowed: ['fill'],
		data: [
			{ cx: 0.2, cy: 0.2, r: 0.8 },
			{ cx: 0.4, cy: 0.4, r: 0.8 },
			{ cx: 0.6, cy: 0.6, r: 0.8 },
			{ cx: 0.8, cy: 0.8, r: 0.8 },
			{ cx: 0.8, cy: 0.2, r: 0.8 },
			{ cx: 0.6, cy: 0.4, r: 0.8 },
			{ cx: 0.4, cy: 0.6, r: 0.8 },
			{ cx: 0.2, cy: 0.8, r: 0.8 }
		]
	},
	Waves: {
		component: 'Path',
		stroke: true,
		data: [
			['M', 0, 0.25],
			['A', 0.6, 0.5, 0, 0, 0, 1, 0.25]
		]
	}
}
