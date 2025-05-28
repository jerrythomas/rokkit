/**
 * Configuration data for FormBuilder demos
 */

// Example 1: Basic data-driven form
export const basicDemo = {
	data: { count: 25, distance: 150 },
	schema: null,
	layout: null
}

// Example 2: Form with custom schema (includes min/max constraints)
export const schemaDemo = {
	data: { count: 25, distance: 150 },
	schema: {
		type: 'object',
		properties: {
			count: {
				type: 'integer',
				min: 10,
				max: 100
			},
			distance: {
				type: 'number',
				min: 50,
				max: 300
			}
		}
	},
	layout: null
}

// Example 3: Form with custom layout (uses number inputs instead of ranges)
export const layoutDemo = {
	data: { count: 25, distance: 150, animate: true, color: '#22d3ee' },
	schema: {
		type: 'object',
		properties: {
			count: { type: 'integer', min: 5, max: 50 },
			distance: { type: 'number', min: 30, max: 200 },
			animate: { type: 'boolean' },
			color: {
				type: 'string',
				enum: ['#22d3ee', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6']
			}
		}
	},
	layout: {
		type: 'vertical',
		elements: [
			{ label: 'Orb Count', scope: '#/count' },
			{ label: 'Connection Distance', scope: '#/distance' },
			{ label: 'Enable Animation', scope: '#/animate' },
			{ label: 'Color', scope: '#/color' }
		]
	}
}
