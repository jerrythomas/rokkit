/**
 * Simulated B2B SaaS sales dataset.
 * 240 orders spanning 2023–2024 across 4 regions, 5 product categories.
 */

const regions = ['North America', 'Europe', 'Asia Pacific', 'Latin America']
const categories = ['Analytics', 'Infrastructure', 'Security', 'Collaboration', 'AI/ML']
const products = {
	Analytics: ['DataViz Pro', 'Query Engine', 'Dashboard Suite'],
	Infrastructure: ['Cloud Infra', 'Edge CDN', 'Storage Plus'],
	Security: ['SecureVault', 'Identity Guard', 'Threat Monitor'],
	Collaboration: ['TeamSync', 'Meeting Pro', 'DocShare'],
	'AI/ML': ['ModelOps', 'AutoML Suite', 'DataPipeline']
}

function seededRandom(seed) {
	let s = seed
	return function () {
		s = (s * 1664525 + 1013904223) >>> 0
		return s / 4294967296
	}
}

function generateSales() {
	const rand = seededRandom(42)
	const records = []

	const regionWeights = [0.38, 0.32, 0.22, 0.08]
	const categoryWeights = [0.28, 0.22, 0.18, 0.16, 0.16]

	for (let i = 0; i < 240; i++) {
		// Pick region by weight
		const rVal = rand()
		let rIdx = 0
		let rCum = 0
		for (let k = 0; k < regionWeights.length; k++) {
			rCum += regionWeights[k]
			if (rVal < rCum) {
				rIdx = k
				break
			}
		}

		// Pick category by weight
		const cVal = rand()
		let cIdx = 0
		let cCum = 0
		for (let k = 0; k < categoryWeights.length; k++) {
			cCum += categoryWeights[k]
			if (cVal < cCum) {
				cIdx = k
				break
			}
		}

		const region = regions[rIdx]
		const category = categories[cIdx]
		const productList = products[category]
		const product = productList[Math.floor(rand() * productList.length)]

		// Date: random day in 2023-2024
		const daysFrom2023 = Math.floor(rand() * 730)
		const date = new Date(2023, 0, 1)
		date.setDate(date.getDate() + daysFrom2023)
		const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
		const quarter = `Q${Math.floor(date.getMonth() / 3) + 1} ${date.getFullYear()}`

		// Amount: log-normal distribution ~$5k–$150k
		const amount = Math.round(Math.exp(8.5 + rand() * 2.5) / 100) * 100
		const quantity = Math.max(1, Math.round(rand() * 20 + 1))
		const margin = 0.45 + rand() * 0.35

		records.push({
			id: i + 1,
			date: date.toISOString().slice(0, 10),
			month,
			quarter,
			year: date.getFullYear(),
			region,
			category,
			product,
			amount,
			quantity,
			margin: Math.round(margin * 100) / 100,
			profit: Math.round(amount * margin)
		})
	}

	return records.sort((a, b) => a.date.localeCompare(b.date))
}

export const sales = generateSales()

// Aggregates for dashboard
export function salesByRegion() {
	const map = new Map()
	for (const row of sales) {
		map.set(row.region, (map.get(row.region) ?? 0) + row.amount)
	}
	return [...map.entries()].map(([region, amount]) => ({ region, amount }))
}

export function salesByCategory() {
	const map = new Map()
	for (const row of sales) {
		map.set(row.category, (map.get(row.category) ?? 0) + row.amount)
	}
	return [...map.entries()].map(([category, amount]) => ({ category, amount }))
}

export function salesByMonth() {
	const map = new Map()
	for (const row of sales) {
		const entry = map.get(row.month) ?? { month: row.month, amount: 0, orders: 0 }
		entry.amount += row.amount
		entry.orders += 1
		map.set(row.month, entry)
	}
	return [...map.values()].sort((a, b) => a.month.localeCompare(b.month))
}

export function topProducts(n = 10) {
	const map = new Map()
	for (const row of sales) {
		const entry = map.get(row.product) ?? { product: row.product, category: row.category, amount: 0, orders: 0 }
		entry.amount += row.amount
		entry.orders += 1
		map.set(row.product, entry)
	}
	return [...map.values()].sort((a, b) => b.amount - a.amount).slice(0, n)
}

// KPI summary
export const kpis = {
	totalRevenue: sales.reduce((s, r) => s + r.amount, 0),
	totalOrders: sales.length,
	avgOrderValue: Math.round(sales.reduce((s, r) => s + r.amount, 0) / sales.length),
	totalProfit: sales.reduce((s, r) => s + r.profit, 0)
}
