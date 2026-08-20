import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import SparkTablePlugin from '../src/SparkTablePlugin.svelte'

const validSpec = JSON.stringify({
	trend: 'avg',
	rows: [
		{ label: 'Growth', data: [4, 8, 5, 11, 7, 13, 9, 15] },
		{ label: 'Platform', data: [10, 9, 11, 8, 7, 6, 8, 9] }
	]
})

describe('SparkTablePlugin', () => {
	it('renders a real <table> wrapped in the [data-spark-table-plugin] hook', () => {
		const { container } = render(SparkTablePlugin, { props: { code: validSpec } })
		const wrap = container.querySelector('[data-spark-table-plugin]')
		expect(wrap).toBeTruthy()
		expect(wrap?.querySelector('table')).toBeTruthy()
	})

	it('renders one table row per series, each with its label and latest value', () => {
		const { container } = render(SparkTablePlugin, { props: { code: validSpec } })
		const rows = container.querySelectorAll('tbody tr')
		expect(rows.length).toBe(2)
		expect(rows[0].textContent).toContain('Growth')
		expect(rows[0].textContent).toContain('15') // last value of Growth's series
		expect(rows[1].textContent).toContain('Platform')
		expect(rows[1].textContent).toContain('9') // last value of Platform's series
	})

	// The trend column composes a REAL <Spark> wrapping REAL <GeomLine>/<GeomTrend> —
	// not a mock — so this is the integration proof that the guide's "table column
	// of sparklines" demo is genuinely built from the Spark composition primitive,
	// the same one Sparkline.svelte now composes internally.
	it('composes a real <Spark> with Line + Trend geoms per row', () => {
		const { container } = render(SparkTablePlugin, { props: { code: validSpec } })
		const sparks = container.querySelectorAll('[data-spark]')
		expect(sparks.length).toBe(2)
		for (const spark of sparks) {
			expect(spark.querySelector('[data-plot-geom="line"]')).toBeTruthy()
			expect(spark.querySelector('[data-plot-geom="trend"]')).toBeTruthy()
			expect(spark.querySelector('[data-plot-trend="avg"]')).toBeTruthy()
		}
	})

	it('omits the trend geom entirely when no `trend` is given (no method to compute)', () => {
		const code = JSON.stringify({ rows: [{ label: 'Solo', data: [1, 2, 3] }] })
		const { container } = render(SparkTablePlugin, { props: { code } })
		expect(container.querySelector('[data-plot-geom="line"]')).toBeTruthy()
		expect(container.querySelector('[data-plot-geom="trend"]')).toBeFalsy()
	})

	it('renders a title caption when `title` is set', () => {
		const code = JSON.stringify({
			title: 'Weekly signups',
			rows: [{ label: 'Growth', data: [1, 2, 3] }]
		})
		const { container } = render(SparkTablePlugin, { props: { code } })
		expect(container.querySelector('[data-spark-table-title]')?.textContent).toBe(
			'Weekly signups'
		)
	})

	it('renders no title paragraph when `title` is absent', () => {
		const code = JSON.stringify({ rows: [{ label: 'Growth', data: [1, 2, 3] }] })
		const { container } = render(SparkTablePlugin, { props: { code } })
		expect(container.querySelector('[data-spark-table-title]')).toBeFalsy()
	})

	it('renders an error badge for invalid JSON', () => {
		const { container } = render(SparkTablePlugin, { props: { code: 'not json' } })
		expect(container.querySelector('[data-block-error]')).toBeTruthy()
	})

	it('renders an error badge when `rows` is missing or malformed', () => {
		const { container } = render(SparkTablePlugin, {
			props: { code: JSON.stringify({ rows: [{ label: 'Bad', data: 'nope' }] }) }
		})
		expect(container.querySelector('[data-block-error]')).toBeTruthy()
	})

	it('shows the raw fence body in the error details', () => {
		const { container } = render(SparkTablePlugin, { props: { code: 'garbage' } })
		const details = container.querySelector('details')
		expect(details?.textContent).toContain('garbage')
	})
})
