/**
 * Realistic business analytics data for the demo dashboard.
 * All data is generated deterministically — no randomness, so SSR and CSR match.
 */

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const CATEGORIES = ['Software', 'Hardware', 'Services', 'Support', 'Training']

const REGIONS = ['North America', 'Europe', 'Asia Pacific', 'Latin America']

const STATUSES = ['Completed', 'Processing', 'Pending', 'Cancelled']

const CUSTOMERS = [
	'Acme Corp', 'Globex Inc', 'Initech', 'Umbrella Ltd', 'Stark Industries',
	'Wayne Enterprises', 'Oscorp', 'Cyberdyne', 'Tyrell Corp', 'Weyland-Yutani',
	'Massive Dynamic', 'Soylent Corp', 'Veridian Dynamics', 'Dunder Mifflin', 'Prestige Worldwide'
]

/** Monthly revenue + orders for the past 12 months */
export function revenueByMonth() {
	const base = [420, 380, 510, 490, 620, 580, 710, 690, 750, 820, 780, 910]
	return MONTHS.map((month, i) => ({
		month,
		revenue: base[i] * 1000,
		orders: Math.round(base[i] * 0.8),
		target: Math.round(base[i] * 1000 * 1.1)
	}))
}

/** Revenue breakdown by category */
export function revenueByCategory() {
	const values = [2840000, 1920000, 1580000, 960000, 720000]
	return CATEGORIES.map((category, i) => ({
		category,
		revenue: values[i],
		growth: [12.4, -3.2, 8.7, 5.1, 22.3][i]
	}))
}

/** Revenue by region */
export function revenueByRegion() {
	const values = [3420000, 2180000, 1640000, 780000]
	return REGIONS.map((region, i) => ({
		region,
		revenue: values[i],
		share: [42.5, 27.1, 20.4, 9.7][i] / 100
	}))
}

/** Recent orders (last 20) */
export function recentOrders() {
	const amounts = [
		12400, 8750, 23100, 4200, 16800, 9300, 31500, 5600, 18900, 7400,
		28000, 11200, 6700, 19500, 42300, 8100, 13600, 25800, 3900, 17200
	]
	return amounts.map((amount, i) => ({
		id: `ORD-${String(10241 + i).padStart(5, '0')}`,
		customer: CUSTOMERS[i % CUSTOMERS.length],
		category: CATEGORIES[i % CATEGORIES.length],
		amount,
		status: STATUSES[i % STATUSES.length],
		date: new Date(2026, 2, 27 - i).toISOString().split('T')[0]
	}))
}

/** KPI summary */
export function kpiSummary() {
	return {
		revenue: { value: 8020000, change: 14.2, label: 'Total Revenue' },
		orders: { value: 6432, change: 8.7, label: 'Total Orders' },
		customers: { value: 1284, change: 22.1, label: 'Active Customers' },
		avgOrder: { value: 1247, change: -3.4, label: 'Avg Order Value' }
	}
}

/** Monthly sparkline series per category (for mini charts) */
export function categorySparklines() {
	const series = {
		Software:  [38, 42, 51, 48, 62, 58, 71, 69, 75, 82, 78, 91],
		Hardware:  [22, 19, 25, 24, 28, 27, 31, 30, 32, 35, 33, 38],
		Services:  [15, 18, 16, 19, 22, 21, 24, 26, 23, 27, 25, 29],
		Support:   [9,  8,  11, 10, 12, 11, 13, 12, 14, 13, 15, 14],
		Training:  [6,  7,  8,  7,  9,  8,  10, 9,  11, 10, 12, 11]
	}
	return CATEGORIES.map((category) => ({
		category,
		data: series[category].map((value, i) => ({ month: MONTHS[i], value: value * 10000 }))
	}))
}
