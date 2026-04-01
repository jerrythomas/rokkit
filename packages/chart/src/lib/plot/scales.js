import { scaleBand, scaleLinear } from 'd3-scale'
import { extent } from 'd3-array'

export function inferFieldType(data, field) {
	const values = data.map((d) => d[field]).filter((v) => v !== null && v !== undefined)
	if (values.length === 0) return 'band'
	const isNumeric = values.every(
		(v) => typeof v === 'number' || (!isNaN(Number(v)) && String(v).trim() !== '')
	)
	return isNumeric ? 'continuous' : 'band'
}

export function inferOrientation(xType, yType) {
	if (xType === 'band' && yType === 'continuous') return 'vertical'
	if (yType === 'band' && xType === 'continuous') return 'horizontal'
	return 'none'
}

export function buildUnifiedXScale(datasets, field, width, opts = {}) {
	const allValues = datasets.flatMap((d) => d.map((r) => r[field]))
	const isNumeric = allValues.every(
		(v) => typeof v === 'number' || (!isNaN(Number(v)) && String(v).trim() !== '')
	)

	// opts.band forces scaleBand even for numeric data (e.g. bar charts with year on X).
	if (opts.domain) {
		const domainIsNumeric = opts.domain.every((v) => typeof v === 'number')
		if (!opts.band && (domainIsNumeric || isNumeric)) {
			return scaleLinear().domain(opts.domain).range([0, width]).nice()
		}
		return scaleBand()
			.domain(opts.domain)
			.range([0, width])
			.padding(opts.padding ?? 0.2)
	}

	if (isNumeric && !opts.band) {
		const numericValues = allValues.map(Number)
		const [minVal, maxVal] = extent(numericValues)
		const domainMin = (opts.includeZero ?? false) ? 0 : (minVal ?? 0)
		return scaleLinear()
			.domain([domainMin, maxVal ?? 0])
			.range([0, width])
			.nice()
	}

	const domain = [...new Set(allValues)].filter((v) => v !== null && v !== undefined)
	return scaleBand()
		.domain(domain)
		.range([0, width])
		.padding(opts.padding ?? 0.2)
}

export function buildUnifiedYScale(datasets, field, height, opts = {}) {
	if (opts.domain) {
		return scaleLinear().domain(opts.domain).range([height, 0]).nice()
	}
	const rawValues = datasets.flatMap((d) => d.map((r) => r[field])).filter((v) => v !== null && v !== undefined)
	const isNumeric = rawValues.length > 0 && rawValues.every(
		(v) => typeof v === 'number' || (!isNaN(Number(v)) && String(v).trim() !== '')
	)
	if (!isNumeric) {
		// Categorical y-axis (e.g. horizontal bar chart) — use scaleBand
		const domain = [...new Set(rawValues.map(String))]
		return scaleBand().domain(domain).range([height, 0]).padding(0.2)
	}
	const numericValues = rawValues.map(Number)
	const [minVal, maxVal] = extent(numericValues)
	const domainMin = (opts.includeZero ?? true) ? 0 : (minVal ?? 0)
	return scaleLinear()
		.domain([domainMin, maxVal ?? 0])
		.range([height, 0])
		.nice()
}

export function inferColorScaleType(data, field, spec = {}) {
	if (spec.colorScale) return spec.colorScale
	if (spec.colorMidpoint !== undefined) return 'diverging'
	const type = inferFieldType(data, field)
	return type === 'continuous' ? 'sequential' : 'categorical'
}
