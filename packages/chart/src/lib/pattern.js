import { clamp } from 'yootils'
import { ColorBrewer } from './color'
import { toHexString, uniqueId } from './utils'

export const builtIn = [
	{ path: 'M0 5A6 6 0 0 0 10 5', minAngle: 0, maxAngle: 90 },
	{ path: 'M0 10L10 0', minAngle: 0, maxAngle: 90 },
	{ path: 'M0 0A10 10 0 0 0 10 10', minAngle: 0, maxAngle: 90 },
	{ path: 'M0 0L10 10', minAngle: 0, maxAngle: 90 },
	{ path: 'M10 5A6 6 0 0 0 0 5', minAngle: 0, maxAngle: 90 },

	{ path: 'M10 10A10 10 0 0 0 0 0', minAngle: 0, maxAngle: 90 },
	{ path: 'M0 0L10 10ZM10 0L0 10Z', minAngle: 0, maxAngle: 90 },
	{ path: 'M1 1L9 1L9 9L1 9Z', minAngle: 0, maxAngle: 90 },
	{ path: 'M4 0L4 10M6 10L6 0M0 4L10 4M10 6L0 6', minAngle: 0, maxAngle: 90 },
	{ path: 'M0 2L8 10M2 0L10 8M0 8L8 0M2 10L10 2', minAngle: 0, maxAngle: 90 },

	{
		path: 'M5 1A 4 4 0 0 0 9 5A4 4 0 0 0 5 9A4 4 0 0 0 1 5A4 4 0 0 0 5 1',
		minAngle: 0,
		maxAngle: 45
	},
	{ path: 'M1 3L7 9M3 1L9 7M1 7L7 1M3 9L9 3', minAngle: 0, maxAngle: 90 },
	{
		path: 'M2 2A4 4 0 0 0 8 2A4 4 0 0 0 8 8A4 4 0 0 0 2 8A4 4 0 0 0 2 2',
		minAngle: 0,
		maxAngle: 90
	},
	{
		path: 'M0 0A5 5 0 0 0 10 0A5 5 0 0 0 10 10A5 5 0 0 0 0 10A5 5 0 0 0 0 0',
		minAngle: 0,
		maxAngle: 45
	},
	{
		path: 'M5 2A 3 3 0 0 0 8 5A3 3 0 0 0 5 8A3 3 0 0 0 2 5A3 3 0 0 0 5 2',
		minAngle: 0,
		maxAngle: 90
	},

	{ path: 'M2 5L5 2L8 5L5 8Z', minAngle: 0, maxAngle: 90 },
	{
		path: 'M3 5A2 2 0 0 0 7 5A2 2 0 0 0 3 5M1 5L9 5M5 1L5 9',
		minAngle: 0,
		maxAngle: 90
	},
	{
		path: 'M2 8L8 2ZM1.5 3.5L3.5 1.5ZM6.5 8.5L8.5 6.5ZM0 0L10 10Z',
		minAngle: 0,
		maxAngle: 90
	},

	{
		path:
			'M2 8L8 2ZM1.5 3.5L3.5 1.5Z' +
			'M6.5 8.5L8.5 6.5Z' +
			'M2 2L8 8M1.5 6.5L3.5 8.5' +
			'M6.5 1.5L8.5 3.5',
		minAngle: 0,
		maxAngle: 90
	},

	{
		path:
			'M5 1 A6 6 0 0 0 5 9' +
			'A6 6 0 0 0 5 1' +
			'M1 5A6 6 0 0 0 9 5A6 6 0 0 0 1 5',
		minAngle: 0,
		maxAngle: 90
	},
	{
		path:
			'M1.5 5A1 1 0 0 0 3.5 5A1 1 0 0 0 1.5 5' +
			'M6.5 5A1 1 0 0 0 8.5 5A1 1 0 0 0 6.5 5' +
			'M5 1.5A1 1 0 0 0 5 3.5A1 1 0 0 0 5 1.5' +
			'M5 6.5A1 1 0 0 0 5 8.5A1 1 0 0 0 5 6.5',
		minAngle: 0,
		maxAngle: 90
	},
	{
		path:
			'M1.5 2.5A1 1 0 0 0 3.5 2.5A1 1 0 0 0 1.5 2.5' +
			'M6.5 2.5A1 1 0 0 0 8.5 2.5A1 1 0 0 0 6.5 2.5' +
			'M2.5 6.5A1 1 0 0 0 2.5 8.5A1 1 0 0 0 2.5 6.5' +
			'M7.5 6.5A1 1 0 0 0 7.5 8.5A1 1 0 0 0 7.5 6.5' +
			'M3.5 5A1 1 0 0 0 6.5 5A1 1 0 0 0 3.5 5',
		minAngle: 0,
		maxAngle: 90
	},
	{
		path:
			'M5 0L6 4L10 5L6 6L5 10L4 6L0 5L4 4Z' + 'M2 1V3M1 2H3' + 'M8 9V7M9 8H7',
		minAngle: 0,
		maxAngle: 90
	},
	{ path: 'M5 2L2.5 9L8.8 4.6L1.2 4.6L7.5 9Z', minAngle: 0, maxAngle: 90 },
	{
		path: 'M0 5A5 5 0 0 0 5 0' + 'M5 10A5 5 0 0 0 0 5' + 'M5 10A5 5 0 0 0 5 0',
		minAngle: 0,
		maxAngle: 90
	},
	{
		path: 'M0 0L10 10M5 0L10 5M0 5 L5 10',
		minAngle: 0,
		maxAngle: 90
	},
	{
		path: 'M0 0L10 10M3 0L10 7M0 7 L3 10',
		minAngle: 0,
		maxAngle: 90
	}
]

export class PatternBrewer {
	constructor() {
		this.paths = builtIn
		this.shades = []
		this.gray = new ColorBrewer().gray()
		this.bw = false
		this.repeat = false
		this.indices = [...this.paths.keys()]
	}

	clear() {
		this.paths = []
	}

	add(path) {
		let paths = Array.isArray(path) ? path : [path]
		this.paths = [...this.paths, ...paths]

		return this
	}

	filter(indices) {
		indices = Array.isArray(indices) ? indices : [indices]
		this.indices = indices.filter((i) => i >= 0 && i < this.paths.length)
		return this
	}

	colors(shades, repeat = false) {
		this.shades = Array.isArray(shades) ? shades : [shades]
		this.repeat = repeat
		return this
	}

	variants(count) {
		count = clamp(count, 1, 15)
		this.paths = this.paths.map((path) => ({
			...path,
			angles: [...Array(count).keys()].map(
				(i) => (i * (path.maxAngle - path.minAngle)) / count
			)
		}))
		return this
	}

	brew() {
		// const hexPrefix = toHexString(prefix)
		const hexPrefix = uniqueId()

		let patterns = []

		// apply filter and add angle variations
		this.indices
			.map((i) => this.paths[i])
			.map((path) => {
				if ('angles' in path) {
					path.angles.map((angle) => patterns.push({ ...path, angle }))
				} else {
					patterns.push(path)
				}
			})

		patterns = patterns
			// Add reference ids
			.map((path, index) => ({
				id: hexPrefix + '-' + toHexString(index),
				...path,
				fillUrl: `url(#${hexPrefix}-${toHexString(index)})`
			}))
			// Add colors
			.map((pattern, i) => {
				return i < this.shades.length || this.repeat
					? { ...pattern, ...this.shades[i % this.shades.length] }
					: { ...pattern, ...this.gray }
			})

		return patterns
	}
}
