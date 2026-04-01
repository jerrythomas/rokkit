import {
	kpiSummary,
	kpiSparklines,
	revenueByMonth,
	revenueByCategory,
	revenueByRegion,
	recentOrders
} from '$lib/data/dashboard.js'

export function load() {
	return {
		kpis: kpiSummary(),
		kpiTrends: kpiSparklines(),
		revenue: revenueByMonth(),
		categories: revenueByCategory(),
		regions: revenueByRegion(),
		orders: recentOrders()
	}
}
