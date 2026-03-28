import {
	kpiSummary,
	revenueByMonth,
	revenueByCategory,
	revenueByRegion,
	recentOrders,
	categorySparklines
} from '$lib/data/dashboard.js'

export function load() {
	return {
		kpis: kpiSummary(),
		revenue: revenueByMonth(),
		categories: revenueByCategory(),
		regions: revenueByRegion(),
		orders: recentOrders(),
		sparklines: categorySparklines()
	}
}
