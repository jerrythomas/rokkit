/**
 * Benchmark fixture generators for @rokkit/data
 *
 * Produces realistic datasets at configurable sizes:
 *   - small:  100 rows
 *   - medium: 1 000 rows
 *   - large:  10 000 rows
 */

const REGIONS = ['North', 'South', 'East', 'West', 'Central']
const PRODUCTS = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta']
const YEARS = [2018, 2019, 2020, 2021, 2022, 2023]
const STATUSES = ['active', 'inactive', 'pending']

/**
 * Generate sales rows: { region, product, year, revenue, units, status }
 */
export function generateSalesData(n) {
	const rows = []
	for (let i = 0; i < n; i++) {
		rows.push({
			region: REGIONS[i % REGIONS.length],
			product: PRODUCTS[i % PRODUCTS.length],
			year: YEARS[i % YEARS.length],
			revenue: Math.round(1000 + Math.random() * 99000),
			units: Math.round(1 + Math.random() * 999),
			status: STATUSES[i % STATUSES.length]
		})
	}
	return rows
}

/**
 * Generate orders/customers pair for join benchmarks.
 */
export function generateJoinData(n) {
	const customers = Array.from({ length: Math.ceil(n / 5) }, (_, i) => ({
		id: i + 1,
		name: `Customer ${i + 1}`,
		tier: i % 3 === 0 ? 'gold' : i % 3 === 1 ? 'silver' : 'bronze'
	}))

	const orders = Array.from({ length: n }, (_, i) => ({
		orderId: i + 1,
		customerId: (i % customers.length) + 1,
		amount: Math.round(10 + Math.random() * 9990),
		year: YEARS[i % YEARS.length]
	}))

	return { customers, orders }
}

/**
 * Pre-aggregated data for alignBy benchmarks:
 * one row per (region, product, year) — some combos intentionally missing.
 */
function buildAlignCombos() {
	// All (region, product, year) combinations as flat list with an index
	return REGIONS.flatMap((region) =>
		PRODUCTS.flatMap((product) => YEARS.map((year) => ({ region, product, year })))
	)
}

export function generateAlignData(n) {
	// Skip ~25% of combos (every 4th) to simulate missing frame values
	return buildAlignCombos()
		.filter((_, id) => id % 4 !== 0)
		.slice(0, n)
		.map((combo) => ({ ...combo, revenue: Math.round(5000 + Math.random() * 45000) }))
}
