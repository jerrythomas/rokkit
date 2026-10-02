/* Sample data the chat shows before the user brings their own: the chart kinds' specs, the
 * products table, the sign-up form and the settings list. Fixtures, not logic.
 */

/**
 * Plot/chart specs for the scripted demo routes, one per route id.
 * Hoisted out of their `build` closures: each is a fixture, not logic, and
 * inline they made every build method longer than it had any reason to be.
 */

/** `line-chart` route. */
export const LINE_CHART_SPEC = {
	title: 'Monthly revenue · trends by product',
	data: [
		{ month: 'Jan', product: 'Pro', revenue: 80 },
		{ month: 'Feb', product: 'Pro', revenue: 92 },
		{ month: 'Mar', product: 'Pro', revenue: 110 },
		{ month: 'Apr', product: 'Pro', revenue: 105 },
		{ month: 'May', product: 'Pro', revenue: 128 },
		{ month: 'Jun', product: 'Pro', revenue: 145 },
		{ month: 'Jan', product: 'Lite', revenue: 30 },
		{ month: 'Feb', product: 'Lite', revenue: 38 },
		{ month: 'Mar', product: 'Lite', revenue: 42 },
		{ month: 'Apr', product: 'Lite', revenue: 50 },
		{ month: 'May', product: 'Lite', revenue: 48 },
		{ month: 'Jun', product: 'Lite', revenue: 55 }
	],
	x: 'month',
	y: 'revenue',
	color: 'product',
	legend: true,
	geoms: [{ type: 'line' }],
	height: 240,
	grid: true,
	margin: { top: 8, right: 16, bottom: 36, left: 44 }
}

/** `area-chart` route. */
export const AREA_CHART_SPEC = {
	title: 'Monthly revenue · stacked area',
	data: [
		{ month: 'Jan', product: 'Pro', revenue: 80 },
		{ month: 'Feb', product: 'Pro', revenue: 92 },
		{ month: 'Mar', product: 'Pro', revenue: 110 },
		{ month: 'Apr', product: 'Pro', revenue: 105 },
		{ month: 'May', product: 'Pro', revenue: 128 },
		{ month: 'Jun', product: 'Pro', revenue: 145 },
		{ month: 'Jan', product: 'Lite', revenue: 30 },
		{ month: 'Feb', product: 'Lite', revenue: 38 },
		{ month: 'Mar', product: 'Lite', revenue: 42 },
		{ month: 'Apr', product: 'Lite', revenue: 50 },
		{ month: 'May', product: 'Lite', revenue: 48 },
		{ month: 'Jun', product: 'Lite', revenue: 55 }
	],
	x: 'month',
	y: 'revenue',
	fill: 'product',
	stack: true,
	legend: true,
	geoms: [{ type: 'area' }],
	height: 240,
	grid: true,
	margin: { top: 8, right: 16, bottom: 36, left: 44 }
}

/** `pie-chart` route. */
export const PIE_CHART_SPEC = {
	title: 'Market share by segment',
	data: [
		{ segment: 'Mobile', share: 42 },
		{ segment: 'Desktop', share: 35 },
		{ segment: 'Tablet', share: 15 },
		{ segment: 'Smart TV', share: 5 },
		{ segment: 'Other', share: 3 }
	],
	y: 'share',
	fill: 'segment',
	legend: true,
	geoms: [{ type: 'arc', options: { innerRadius: 60 } }],
	height: 280,
	margin: { top: 8, right: 16, bottom: 8, left: 16 }
}

/** `scatter-plot` route. */
export const SCATTER_PLOT_SPEC = {
	title: 'Engine displacement vs highway mpg',
	data: [
		{ class: 'compact', displ: 1.4, hwy: 35 },
		{ class: 'compact', displ: 1.6, hwy: 33 },
		{ class: 'compact', displ: 1.8, hwy: 31 },
		{ class: 'midsize', displ: 2.0, hwy: 30 },
		{ class: 'midsize', displ: 2.4, hwy: 28 },
		{ class: 'midsize', displ: 3.0, hwy: 25 },
		{ class: 'suv', displ: 3.0, hwy: 23 },
		{ class: 'suv', displ: 3.5, hwy: 22 },
		{ class: 'suv', displ: 4.0, hwy: 20 },
		{ class: 'suv', displ: 4.6, hwy: 18 },
		{ class: 'pickup', displ: 4.0, hwy: 19 },
		{ class: 'pickup', displ: 5.0, hwy: 17 },
		{ class: 'pickup', displ: 5.7, hwy: 16 }
	],
	x: 'displ',
	y: 'hwy',
	color: 'class',
	legend: true,
	geoms: [{ type: 'point' }],
	height: 280,
	grid: true,
	margin: { top: 8, right: 16, bottom: 36, left: 44 }
}

/** `bubble-chart` route. */
export const BUBBLE_CHART_SPEC = {
	title: 'City vs highway mpg · size = displ',
	data: [
		{ class: 'compact', cty: 28, hwy: 35, displ: 1.4 },
		{ class: 'compact', cty: 26, hwy: 33, displ: 1.6 },
		{ class: 'midsize', cty: 22, hwy: 30, displ: 2.0 },
		{ class: 'midsize', cty: 20, hwy: 28, displ: 2.4 },
		{ class: 'suv', cty: 17, hwy: 23, displ: 3.0 },
		{ class: 'suv', cty: 16, hwy: 22, displ: 3.5 },
		{ class: 'suv', cty: 14, hwy: 20, displ: 4.0 },
		{ class: 'pickup', cty: 14, hwy: 19, displ: 4.0 },
		{ class: 'pickup', cty: 12, hwy: 17, displ: 5.0 },
		{ class: 'pickup', cty: 11, hwy: 16, displ: 5.7 }
	],
	x: 'cty',
	y: 'hwy',
	color: 'class',
	legend: true,
	geoms: [{ type: 'point', size: 'displ' }],
	height: 280,
	grid: true,
	margin: { top: 8, right: 16, bottom: 36, left: 44 }
}

/** `box-plot` route. */
export const BOX_PLOT_SPEC = {
	title: 'Highway mpg distribution by class',
	data: [
		{ class: 'compact', hwy: 35 }, { class: 'compact', hwy: 33 }, { class: 'compact', hwy: 31 }, { class: 'compact', hwy: 29 }, { class: 'compact', hwy: 27 },
		{ class: 'midsize', hwy: 30 }, { class: 'midsize', hwy: 28 }, { class: 'midsize', hwy: 26 }, { class: 'midsize', hwy: 25 }, { class: 'midsize', hwy: 24 },
		{ class: 'suv', hwy: 23 }, { class: 'suv', hwy: 22 }, { class: 'suv', hwy: 20 }, { class: 'suv', hwy: 18 }, { class: 'suv', hwy: 17 },
		{ class: 'pickup', hwy: 19 }, { class: 'pickup', hwy: 17 }, { class: 'pickup', hwy: 16 }, { class: 'pickup', hwy: 15 }, { class: 'pickup', hwy: 14 }
	],
	x: 'class',
	y: 'hwy',
	geoms: [{ type: 'box' }],
	height: 260,
	grid: true,
	margin: { top: 8, right: 16, bottom: 36, left: 44 }
}

/** `violin-plot` route. */
export const VIOLIN_PLOT_SPEC = {
	title: 'Highway mpg density by class',
	data: [
		{ class: 'compact', hwy: 35 }, { class: 'compact', hwy: 33 }, { class: 'compact', hwy: 31 }, { class: 'compact', hwy: 29 }, { class: 'compact', hwy: 27 },
		{ class: 'midsize', hwy: 30 }, { class: 'midsize', hwy: 28 }, { class: 'midsize', hwy: 26 }, { class: 'midsize', hwy: 25 }, { class: 'midsize', hwy: 24 },
		{ class: 'suv', hwy: 23 }, { class: 'suv', hwy: 22 }, { class: 'suv', hwy: 20 }, { class: 'suv', hwy: 18 }, { class: 'suv', hwy: 17 },
		{ class: 'pickup', hwy: 19 }, { class: 'pickup', hwy: 17 }, { class: 'pickup', hwy: 16 }, { class: 'pickup', hwy: 15 }, { class: 'pickup', hwy: 14 }
	],
	x: 'class',
	y: 'hwy',
	geoms: [{ type: 'violin' }],
	height: 260,
	grid: true,
	margin: { top: 8, right: 16, bottom: 36, left: 44 }
}

/** `chart` route. */
export const CHART_SPEC = {
	title: 'Quarterly revenue · FY 2026',
	data: [
		{ quarter: 'Q1', revenue: 42 },
		{ quarter: 'Q2', revenue: 58 },
		{ quarter: 'Q3', revenue: 51 },
		{ quarter: 'Q4', revenue: 73 }
	],
	x: 'quarter',
	y: 'revenue',
	geoms: [{ type: 'bar' }],
	height: 220,
	grid: true,
	margin: { top: 8, right: 16, bottom: 36, left: 44 }
}
/** `chart-grouped` route dataset — the spec around it varies with the query. */
export const REVENUE_BY_PRODUCT = [
	{ quarter: 'Q1', product: 'Hardware', revenue: 24 },
	{ quarter: 'Q1', product: 'Software', revenue: 18 },
	{ quarter: 'Q2', product: 'Hardware', revenue: 31 },
	{ quarter: 'Q2', product: 'Software', revenue: 27 },
	{ quarter: 'Q3', product: 'Hardware', revenue: 28 },
	{ quarter: 'Q3', product: 'Software', revenue: 23 },
	{ quarter: 'Q4', product: 'Hardware', revenue: 39 },
	{ quarter: 'Q4', product: 'Software', revenue: 34 }
]

/**
 * `list` route items. Every leaf carries an explicit `value`: without one the
 * selection value falls back to the raw item object and matching is by
 * reference, which breaks as soon as it passes through `$state`.
 */
export const SETTINGS_MENU_ITEMS = [
	{
		label: 'General',
		icon: 'i-mdi:cog-outline',
		children: [
			{ label: 'Profile', value: 'profile', icon: 'i-mdi:account-outline' },
			{ label: 'Account', value: 'account', icon: 'i-mdi:shield-account-outline' },
			{ label: 'Notifications', value: 'notifications', icon: 'i-mdi:bell-outline' }
		]
	},
	{
		label: 'Appearance',
		icon: 'i-mdi:palette-outline',
		children: [
			{ label: 'Theme', value: 'theme', icon: 'i-mdi:invert-colors' },
			{ label: 'Density', value: 'density', icon: 'i-mdi:format-line-spacing' }
		]
	}
]

/** The products the table demo opens with. */
export const PRODUCTS = [
	{ name: 'Laptop', price: 1299, stock: 45 },
	{ name: 'Phone', price: 899, stock: 120 },
	{ name: 'Tablet', price: 599, stock: 78 },
	{ name: 'Monitor', price: 449, stock: 32 },
	{ name: 'Keyboard', price: 129, stock: 210 },
	{ name: 'Mouse', price: 59, stock: 340 }
]

/** The sign-up form the form demo opens with. */
export const SIGNUP_SCHEMA = {
	type: 'object',
	properties: {
		name: { type: 'string', required: true },
		email: { type: 'string', format: 'email', required: true },
		role: { type: 'string', enum: ['admin', 'editor', 'viewer', 'user'] },
		newsletter: { type: 'boolean' }
	}
}
export const SIGNUP_DATA = { name: '', email: '', role: 'user', newsletter: true }
