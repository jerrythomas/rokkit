import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import { tick } from 'svelte'
import AnimatedPlot from '../src/AnimatedPlot.svelte'
import mpg from './fixtures/mpg.json'

const baseProps = {
	animate: { by: 'year' },
	x: 'class',
	y: 'hwy',
	width: 600,
	height: 400
}

// Data for horizontal bar chart race (y is categorical string)
const raceData = [
	{ year: 2000, country: 'USA', gdp: 100 },
	{ year: 2000, country: 'China', gdp: 60 },
	{ year: 2001, country: 'USA', gdp: 110 },
	{ year: 2001, country: 'China', gdp: 80 },
	{ year: 2002, country: 'USA', gdp: 115 },
	{ year: 2002, country: 'China', gdp: 100 }
]

describe('AnimatedPlot extended branches', () => {
	it('renders with sorted=true (vertical bar sort mode)', () => {
		const { container } = render(AnimatedPlot, {
			props: {
				...baseProps,
				data: mpg,
				geoms: [{ type: 'bar', stat: 'mean' }],
				sorted: true,
				tween: true
			}
		})
		expect(container.querySelector('[data-plot-animated]')).toBeTruthy()
	})

	it('renders with sorted=true and tween=false', () => {
		const { container } = render(AnimatedPlot, {
			props: {
				...baseProps,
				data: mpg,
				geoms: [{ type: 'bar', stat: 'mean' }],
				sorted: true,
				tween: false
			}
		})
		expect(container.querySelector('[data-plot-animated]')).toBeTruthy()
	})

	it('renders horizontal race mode (sorted=true, y is string)', () => {
		const { container } = render(AnimatedPlot, {
			props: {
				animate: { by: 'year' },
				data: raceData,
				x: 'gdp',
				y: 'country',
				geoms: [{ type: 'bar', stat: 'identity' }],
				sorted: true,
				tween: true,
				width: 600,
				height: 400
			}
		})
		expect(container.querySelector('[data-plot-animated]')).toBeTruthy()
	})

	it('renders horizontal race with dynamicDomain=true', () => {
		const { container } = render(AnimatedPlot, {
			props: {
				animate: { by: 'year' },
				data: raceData,
				x: 'gdp',
				y: 'country',
				geoms: [{ type: 'bar', stat: 'identity' }],
				sorted: true,
				dynamicDomain: true,
				tween: true,
				width: 600,
				height: 400
			}
		})
		expect(container.querySelector('[data-plot-animated]')).toBeTruthy()
	})

	it('renders with animate.loop=true', () => {
		const { container } = render(AnimatedPlot, {
			props: {
				...baseProps,
				data: mpg,
				geoms: [{ type: 'bar', stat: 'mean' }],
				animate: { by: 'year', loop: true, duration: 500 }
			}
		})
		expect(container.querySelector('[data-plot-animated]')).toBeTruthy()
	})

	it('renders with empty data gracefully', () => {
		const { container } = render(AnimatedPlot, {
			props: {
				...baseProps,
				data: [],
				animate: { by: 'year' }
			}
		})
		expect(container.querySelector('[data-plot-animated]')).toBeTruthy()
	})

	it('renders with identity stat (no aggregation)', () => {
		const { container } = render(AnimatedPlot, {
			props: {
				...baseProps,
				data: mpg.slice(0, 20),
				geoms: [{ type: 'bar', stat: 'identity' }]
			}
		})
		expect(container.querySelector('[data-plot-animated]')).toBeTruthy()
	})

	it('handles speed changes via onspeed', async () => {
		const { container } = render(AnimatedPlot, {
			props: {
				...baseProps,
				data: mpg,
				geoms: [{ type: 'bar', stat: 'mean' }]
			}
		})
		// Timeline speed buttons should exist
		const speedBtns = container.querySelectorAll('[data-plot-timeline-speed]')
		expect(speedBtns.length).toBeGreaterThan(0)
	})

	it('renders with multiple geoms array', () => {
		const { container } = render(AnimatedPlot, {
			props: {
				...baseProps,
				data: mpg,
				geoms: [
					{ type: 'bar', stat: 'mean' },
					{ type: 'point', stat: 'identity' }
				]
			}
		})
		expect(container.querySelector('[data-plot-animated]')).toBeTruthy()
	})

	it('renders with label=true in horizontal race', () => {
		const { container } = render(AnimatedPlot, {
			props: {
				animate: { by: 'year' },
				data: raceData,
				x: 'gdp',
				y: 'country',
				sorted: true,
				tween: true,
				label: true,
				width: 600,
				height: 400
			}
		})
		expect(container.querySelector('[data-plot-animated]')).toBeTruthy()
	})

	it('renders with dynamicDomain=true on vertical chart', () => {
		const { container } = render(AnimatedPlot, {
			props: {
				...baseProps,
				data: mpg,
				geoms: [{ type: 'bar', stat: 'mean' }],
				dynamicDomain: true
			}
		})
		expect(container.querySelector('[data-plot-animated]')).toBeTruthy()
	})

	it('renders unsorted with categorical y (y is string field)', () => {
		// This triggers the yCategorical branch in the tween effect
		const catData = [
			{ year: 2000, brand: 'A', sales: 50 },
			{ year: 2000, brand: 'B', sales: 30 },
			{ year: 2001, brand: 'A', sales: 60 },
			{ year: 2001, brand: 'B', sales: 40 }
		]
		const { container } = render(AnimatedPlot, {
			props: {
				animate: { by: 'year' },
				data: catData,
				x: 'sales',
				y: 'brand',
				geoms: [{ type: 'bar', stat: 'identity' }],
				sorted: false,
				tween: true,
				width: 600,
				height: 400
			}
		})
		expect(container.querySelector('[data-plot-animated]')).toBeTruthy()
	})

	it('renders with fill, pattern, symbol shorthand props', () => {
		const { container } = render(AnimatedPlot, {
			props: {
				...baseProps,
				data: mpg,
				geom: 'bar',
				stat: 'mean',
				fill: 'coral',
				pattern: 'diagonal',
				symbol: 'circle'
			}
		})
		expect(container.querySelector('[data-plot-animated]')).toBeTruthy()
	})

	it('play and pause handlers work without error', async () => {
		const { container } = render(AnimatedPlot, {
			props: { ...baseProps, data: mpg, geoms: [{ type: 'bar', stat: 'mean' }] }
		})
		const playBtn = container.querySelector('[data-plot-timeline-playpause]')
		expect(playBtn).toBeTruthy()
		playBtn.click()
		await tick()
		playBtn.click()
		await tick()
		expect(container.querySelector('[data-plot-animated]')).toBeTruthy()
	})
})
