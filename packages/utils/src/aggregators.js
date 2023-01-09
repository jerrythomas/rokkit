import { quantile } from 'd3-array'

export const counter = (values) => values.length
export const quantiles = (values) => {
	const q1 = quantile(values, 0.25)
	const q3 = quantile(values, 0.75)
	const iqr = q3 - q1

	return { q1, q3, iqr, qr_min: q1 - 1.5 * iqr, qr_max: q1 + 1.5 * iqr }
}
