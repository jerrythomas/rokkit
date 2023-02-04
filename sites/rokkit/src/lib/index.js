import watchMedia from 'svelte-media'

const mediaqueries = {
	small: '(max-width: 767px)',
	medium: '(min-width: 768px) and (max-width: 1023px)',
	large: '(min-width: 1024px)',
	extraLarge: '(min-width: 1280px)',
	short: '(max-height: 399px)',
	landscape: '(orientation: landscape) and (max-height: 499px)',
	tiny: '(orientation: portrait) and (max-height: 599px)',
	dark: '(prefers-color-scheme: dark)',
	noanimations: '(prefers-reduced-motion: reduce)'
}

const modules = import.meta.glob(
	'./stories/**/{App.svelte,metadata.js,guide.svx}'
)
const samples = import.meta.glob('./stories/**/*.{svelte,js}', { as: 'raw' })

export const storyFiles = { modules, samples }
export const media = watchMedia(mediaqueries)

// import { toHyphenCase, list } from '@rokkit/utils'

// export const components = [
// 	{ category: 'Lists', name: 'List' },
// 	{ category: 'Lists', name: 'Accordion' }
// 	// { category: 'Lists', name: 'NestedList' },
// 	// { category: 'Lists', name: 'Tree' }
// 	// { category: 'Input', name: 'Text', type: 'text' },
// 	// { category: 'Input', name: 'Number', type: 'number' },
// 	// { category: 'Input', name: 'Email', type: 'email' },
// 	// { category: 'Input', name: 'Password', type: 'password' },
// 	// { category: 'Input', name: 'Search', type: 'search' },
// 	// { category: 'Input', name: 'Tel', type: 'tel' },
// 	// { category: 'Input', name: 'Url', type: 'url' },
// 	// { category: 'Input', name: 'Range', type: 'range' },
// 	// { category: 'Input', name: 'Color', type: 'color' },
// 	// { category: 'Input', name: 'Date', type: 'date' },
// 	// { category: 'Input', name: 'Time', type: 'time' },
// 	// { category: 'Input', name: 'Datetime-local', type: 'datetime-local' },
// 	// { category: 'Input', name: 'Month', type: 'month' },
// 	// { category: 'Input', name: 'Week', type: 'week' },
// 	// { category: 'Input', name: 'TextArea' },
// 	// { category: 'Input', name: 'Select' },
// 	// { category: 'Input', name: 'Checkbox' },
// 	// { category: 'Input', name: 'CheckboxGroup' },
// 	// { category: 'Input', name: 'RadioGroup' },
// 	// { category: 'Button', name: 'Button' },
// 	// { category: 'Form', name: 'Form' },
// 	// { category: 'Form', name: 'FormFields' },
// 	// { category: 'Form', name: 'MasterDetail' },
// 	// { category: 'Image', name: 'Image' },
// 	// { category: 'Card', name: 'Card' },
// 	// { category: 'Modal', name: 'Modal' },
// 	// { category: 'Chart', name: 'Line', type: 'line' },
// 	// { category: 'Chart', name: 'Bar', type: 'bar' },
// 	// { category: 'Chart', name: 'Pie', type: 'pie' },
// 	// { category: 'Chart', name: 'Doughnut', type: 'doughnut' },
// 	// { category: 'Chart', name: 'Radar', type: 'radar' },
// 	// { category: 'Chart', name: 'Scatter', type: 'scatter' },
// 	// { category: 'Chart', name: 'Area', type: 'area' },
// 	// { category: 'Chart', name: 'Bubble', type: 'bubble' },
// 	// { category: 'Chart', name: 'Candlestick', type: 'candlestick' },
// 	// { category: 'Chart', name: 'Funnel', type: 'funnel' },
// 	// { category: 'Chart', name: 'Gauge', type: 'gauge' },
// 	// { category: 'Chart', name: 'Heatmap', type: 'heatmap' },
// 	// { category: 'Chart', name: 'Histogram', type: 'histogram' },
// 	// { category: 'Chart', name: 'Map', type: 'map' },
// 	// { category: 'Chart', name: 'Sankey', type: 'sankey' },
// 	// { category: 'Chart', name: 'Timeline', type: 'timeline' },
// 	// { category: 'Chart', name: 'Tree', type: 'tree' },
// 	// { category: 'Chart', name: 'Waterfall', type: 'waterfall' },
// 	// { category: 'Chart', name: 'Wordcloud', type: 'wordcloud' }
// ].map((x) => ({
// 	...x,
// 	icon:
// 		'i-component:' +
// 		(x.type ? x.category + '-' + x.type : toHyphenCase(x.name)).toLowerCase(),
// 	url: '/' + x.name.toLowerCase(),
// 	component: 'link'
// }))

// export const categories = components.reduce((acc, x) => ({
// 	...acc,
// 	[x.category]: { open: true }
// }))
