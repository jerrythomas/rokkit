/* eslint-disable no-console */
/**
 * Benchmark runner for @rokkit/data
 *
 * Measures wall-clock time (ms) for each operation across data sizes.
 * Runs each case ITERATIONS times and reports min/mean/max.
 *
 * Usage:  bun benchmark/runner.js [--save]
 *   --save   writes results to benchmark/results/<timestamp>.json
 */

import { mean, sum } from 'd3-array'
import { dataset, leftJoin, crossJoin, antiJoin, semiJoin, filterData } from '../src/index.js'
import { generateSalesData, generateJoinData, generateAlignData } from './fixtures.js'

const ITERATIONS = 10
const SIZES = { small: 100, medium: 1000, large: 10000 }

// ─────────────────────────────────────────────
// Timing helpers
// ─────────────────────────────────────────────

function time(fn) {
	const start = performance.now()
	fn()
	return performance.now() - start
}

function bench(label, size, fn) {
	const times = []
	for (let i = 0; i < ITERATIONS; i++) {
		times.push(time(fn))
	}
	times.sort((a, b) => a - b)
	return {
		label,
		size,
		iterations: ITERATIONS,
		min: round(times[0]),
		mean: round(mean(times)),
		max: round(times[times.length - 1]),
		p50: round(times[Math.floor(times.length * 0.5)]),
		p95: round(times[Math.floor(times.length * 0.95)])
	}
}

function round(n) {
	return Math.round(n * 1000) / 1000
}

// ─────────────────────────────────────────────
// Benchmark suites
// ─────────────────────────────────────────────

function benchGroupByRollup(data, size) {
	return bench('groupBy+rollup', size, () => {
		dataset(data).groupBy('region', 'product').rollup().select()
	})
}

function benchGroupBySummarize(data, size) {
	return bench('groupBy+summarize+rollup', size, () => {
		dataset(data)
			.groupBy('region')
			.summarize((row) => row.revenue, { revenue: sum })
			.rollup()
			.select()
	})
}

function benchAlignBy(data, size) {
	return bench('groupBy+alignBy+rollup', size, () => {
		dataset(data)
			.groupBy('region', 'product')
			.alignBy('year')
			.usingTemplate({ revenue: 0 })
			.rollup()
			.select()
	})
}

function benchLeftJoin(orders, customers, size) {
	return bench('leftJoin', size, () => {
		leftJoin(orders, customers, (o, c) => o.customerId === c.id)
	})
}

function benchCrossJoin(a, b, label, size) {
	return bench('crossJoin', size, () => {
		crossJoin(a, b)
	})
}

function benchAntiJoin(orders, customers, size) {
	return bench('antiJoin', size, () => {
		antiJoin(orders, customers, (o, c) => o.customerId === c.id)
	})
}

function benchSemiJoin(orders, customers, size) {
	return bench('semiJoin', size, () => {
		semiJoin(orders, customers, (o, c) => o.customerId === c.id)
	})
}

function benchWhereApplySortBy(data, size) {
	return bench('where+apply+sortBy', size, () => {
		dataset(data)
			.where((r) => r.status === 'active')
			.apply((r) => ({ ...r, total: r.revenue * r.units }))
			.sortBy('region', 'year')
			.select()
	})
}

function benchFilterData(data, size) {
	return bench('filterData', size, () => {
		filterData(data, [
			{ column: 'status', operator: '=', value: 'active' },
			{ column: 'revenue', operator: '>', value: 10000 }
		])
	})
}

// ─────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────

function buildOps({ salesData, alignData, orders, customers, sizeName, n }) {
	const ops = [
		() => benchGroupByRollup(salesData, sizeName),
		() => benchGroupBySummarize(salesData, sizeName),
		() => benchAlignBy(alignData, sizeName),
		() => benchLeftJoin(orders, customers, sizeName),
		() => benchAntiJoin(orders, customers, sizeName),
		() => benchSemiJoin(orders, customers, sizeName),
		() => benchWhereApplySortBy(salesData, sizeName),
		() => benchFilterData(salesData, sizeName)
	]
	// Cross join: keep it small to avoid combinatorial explosion
	if (n <= 1000) {
		const a = salesData.slice(0, 20)
		const b = customers.slice(0, 20)
		ops.push(() => benchCrossJoin(a, b, 'crossJoin', sizeName))
	}
	return ops
}

function runSizeResults(sizeName, n, out) {
	console.log(`\n── ${sizeName} (n=${n}) ──`)
	const salesData = generateSalesData(n)
	const alignData = generateAlignData(n)
	const { orders, customers } = generateJoinData(n)
	const ops = buildOps({ salesData, alignData, orders, customers, sizeName, n })
	for (const op of ops) {
		const r = op()
		out.push(r)
		console.log(
			`  ${r.label.padEnd(28)} mean=${r.mean.toFixed(3)}ms  min=${r.min.toFixed(3)}ms  max=${r.max.toFixed(3)}ms`
		)
	}
}

export function runBenchmarks(phase = 'baseline') {
	const results = {
		phase,
		timestamp: new Date().toISOString(),
		environment: {
			runtime: typeof Bun !== 'undefined' ? `Bun ${Bun.version}` : `Node ${process.version}`,
			platform: process.platform,
			arch: process.arch
		},
		results: []
	}

	for (const [sizeName, n] of Object.entries(SIZES)) {
		runSizeResults(sizeName, n, results.results)
	}

	return results
}
