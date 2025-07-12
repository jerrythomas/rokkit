// const metadata = import.meta.glob('./*/**/meta.json')
/**
 * Tutorial sections organized for GroupedList component
 * Comprehensive tutorial structure covering all Rokkit components and concepts
 */

export const sections = [
	{
		id: 'welcome',
		title: 'Welcome to Rokkit',
		description: 'Introduction and getting started with the Rokkit ecosystem',
		children: [
			{
				id: 'introduction',
				title: 'Introduction',
				description: 'Learn what Rokkit is and why it exists',
				icon: '👋',
				slug: 'welcome/introduction'
			},
			{
				id: 'getting-started',
				title: 'Getting Started',
				description: 'Set up your first Rokkit project',
				icon: '🚀',
				slug: 'welcome/getting-started'
			}
		]
	},
	{
		id: 'elements',
		title: 'Elements',
		description: 'Core UI components for selection, navigation, and data display',
		children: [
			{
				id: 'list',
				title: 'List',
				description: 'Display and select from collections of items',
				icon: '📋',
				slug: 'elements/list'
			},
			{
				id: 'tabs',
				title: 'Tabs',
				description: 'Navigate between different content sections',
				icon: '📑',
				slug: 'elements/tabs'
			},
			{
				id: 'accordion',
				title: 'Accordion',
				description: 'Collapsible content sections',
				icon: '🪗',
				slug: 'elements/accordion'
			},
			{
				id: 'tree',
				title: 'Tree',
				description: 'Hierarchical data navigation',
				icon: '🌳',
				slug: 'elements/tree'
			},
			{
				id: 'switch',
				title: 'Switch',
				description: 'Toggle between multiple options',
				icon: '🔀',
				slug: 'elements/switch'
			},
			{
				id: 'select',
				title: 'Select',
				description: 'Choose single values from dropdown lists',
				icon: '🔽',
				slug: 'elements/select'
			},
			{
				id: 'multi-select',
				title: 'MultiSelect',
				description: 'Choose multiple values from lists',
				icon: '☑️',
				slug: 'elements/multi-select'
			},
			{
				id: 'drop-down',
				title: 'DropDown',
				description: 'Context menus and action lists',
				icon: '⬇️',
				slug: 'elements/drop-down'
			},
			{
				id: 'table',
				title: 'Table',
				description: 'Display tabular data with sorting and hierarchy',
				icon: '📊',
				slug: 'elements/table'
			}
		]
	},
	{
		id: 'primitives',
		title: 'Primitives',
		description: 'Basic building blocks for creating custom components',
		children: [
			{
				id: 'icon',
				title: 'Icon',
				description: 'Display icons with customizable sizes and styles',
				icon: '🎨',
				slug: 'primitives/icon'
			},
			{
				id: 'item',
				title: 'Item',
				description: 'Flexible content renderer for text, icons, and images',
				icon: '🧩',
				slug: 'primitives/item'
			},
			{
				id: 'pill',
				title: 'Pill',
				description: 'Removable item wrappers and tags',
				icon: '💊',
				slug: 'primitives/pill'
			}
		]
	},
	{
		id: 'utilities',
		title: 'Utilities',
		description: 'Helper components for validation, layout, and visual aids',
		children: [
			{
				id: 'validation-report',
				title: 'ValidationReport',
				description: 'Display validation results and status',
				icon: '✅',
				slug: 'utilities/validation-report'
			},
			{
				id: 'connector',
				title: 'Connector',
				description: 'Visual connectors for tree and nested layouts',
				icon: '🔗',
				slug: 'utilities/connector'
			}
		]
	},
	{
		id: 'layout',
		title: 'Layout Components',
		description: 'Components for organizing and structuring application layouts',
		children: [
			{
				id: 'responsive-grid',
				title: 'ResponsiveGrid',
				description: 'Flexible grid layouts that adapt to screen size',
				icon: '📐',
				slug: 'layout/responsive-grid'
			},
			{
				id: 'nav-content',
				title: 'NavContent',
				description: 'Navigation and content layout patterns',
				icon: '🧭',
				slug: 'layout/nav-content'
			},
			{
				id: 'stepper',
				title: 'Stepper',
				description: 'Multi-step process navigation',
				icon: '👣',
				slug: 'layout/stepper'
			}
		]
	},
	{
		id: 'forms',
		title: 'Forms',
		description: 'Form building, validation, and advanced form features',
		children: [
			{
				id: 'inputs',
				title: 'Input Components',
				description: 'Explore different input types and their properties',
				icon: '📝',
				slug: 'forms/inputs'
			},
			{
				id: 'builder',
				title: 'FormBuilder',
				description: 'Create forms from data with automatic schema derivation',
				icon: '🏗️',
				slug: 'forms/builder'
			},
			{
				id: 'renderer',
				title: 'FormRenderer',
				description: 'Render forms with snippet-based customization',
				icon: '📄',
				slug: 'forms/renderer'
			},
			{
				id: 'validation',
				title: 'Validation',
				description: 'Add validation with real-time feedback',
				icon: '✅',
				slug: 'forms/validation'
			},
			{
				id: 'advanced',
				title: 'Advanced Features',
				description: 'Custom snippets, nested forms, and complex layouts',
				icon: '⚙️',
				slug: 'forms/advanced'
			}
		]
	},
	{
		id: 'theming',
		title: 'Theming',
		description: 'Customize colors, themes, and visual appearance',
		children: [
			{
				id: 'colors',
				title: 'Colors',
				description: 'Color palette and theming system',
				icon: '🎨',
				slug: 'theming/colors'
			}
		]
	}
]

export const fields = { text: 'title' }

/**
 * Get all individual sections flattened from groups
 * @returns {Array} Array of all tutorial sections
 */
export function getAllSections() {
	return sections.flatMap((group) => group.children)
}

/**
 * Find a section by its ID
 * @param {string} sectionId - The section ID to find
 * @returns {Object|null} The section object or null if not found
 */
export function findSection(sectionId) {
	for (const group of sections) {
		const section = group.children.find((child) => child.id === sectionId)
		if (section) return section
	}
	return null
}

/**
 * Get the group that contains a specific section
 * @param {string} sectionId - The section ID to find the group for
 * @returns {Object|null} The group object or null if not found
 */
export function findGroupForSection(sectionId) {
	return sections.find((group) => group.children.some((child) => child.id === sectionId)) || null
}
