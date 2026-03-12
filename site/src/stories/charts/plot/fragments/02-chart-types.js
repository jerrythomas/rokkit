// @ts-nocheck
// Different chart types using the Plot component
import { Plot } from '@rokkit/chart'

// Scatter plot for correlation analysis
const scatterConfig = {
	data: carData,
	x: 'mpg',
	y: 'hp',
	stroke: 'cyl',
	symbol: 'transmission',
	legend: true
}

// Line chart for trends over time
const lineConfig = {
	data: timeSeriesData,
	x: 'date',
	y: 'value',
	stroke: 'series',
	curve: 'natural',
	legend: true
}

// Bar chart for categorical comparisons
const barConfig = {
	data: categoryData,
	x: 'category',
	y: 'amount',
	fill: 'category',
	sort: { x: 'y', reverse: true }
}

// Area chart for cumulative data
const areaConfig = {
	data: cumulativeData,
	x: 'period',
	y: 'total',
	fill: 'department',
	stack: true
}
