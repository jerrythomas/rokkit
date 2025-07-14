const schema = {
	type: 'object',
	properties: {
		orientation: {
			type: 'string',
			title: 'Orientation',
			description: 'Layout direction of the tabs',
			enum: ['horizontal', 'vertical'],
			default: 'horizontal'
		},
		position: {
			type: 'string',
			title: 'Position',
			description: 'Position of tab bar relative to content',
			enum: ['before', 'after'],
			default: 'before'
		},
		align: {
			type: 'string',
			title: 'Alignment',
			description: 'Alignment of tabs within the tab bar',
			enum: ['start', 'center', 'end'],
			default: 'start'
		},
		editable: {
			type: 'boolean',
			title: 'Editable',
			description: 'Show add/remove buttons for tabs',
			default: false
		},
		placeholder: {
			type: 'string',
			title: 'Placeholder Text',
			description: 'Text shown when no tab is selected',
			default: 'Select a tab to view its content.'
		}
	}
}

const layout = {
	type: 'vertical',
	elements: [
		{
			scope: '#/orientation',
			label: 'Orientation',
			description: 'Layout direction of the tabs'
		},
		{
			scope: '#/position',
			label: 'Position',
			description: 'Position of tab bar relative to content'
		},
		{
			scope: '#/align',
			label: 'Alignment',
			description: 'Alignment of tabs within the tab bar'
		},
		{
			scope: '#/editable',
			label: 'Editable',
			description: 'Show add/remove buttons for tabs'
		},
		{
			scope: '#/placeholder',
			label: 'Placeholder Text',
			description: 'Text shown when no tab is selected'
		}
	]
}
const config = {
	orientation: 'horizontal',
	position: 'before',
	align: 'start',
	editable: false,
	placeholder: 'Select a tab to view its content.'
}
const items = [
	{
		id: 'tab1',
		label: 'First Tab',
		content:
			'This is the content of the first tab. Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
	},
	{
		id: 'tab2',
		label: 'Second Tab',
		content: 'Content for the second tab goes here. Sed do eiusmod tempor incididunt ut labore.'
	},
	{
		id: 'tab3',
		label: 'Third Tab',
		content: 'The third tab contains this information. Ut enim ad minim veniam, quis nostrud.'
	},
	{
		id: 'tab4',
		label: 'Fourth Tab',
		content: 'Fourth tab content is displayed here. Excepteur sint occaecat cupidatat non proident.'
	}
]
/** @type {import('./$types').PageServerLoad} */
export function load() {
	return {
		schema,
		layout,
		config,
		items
	}
}
