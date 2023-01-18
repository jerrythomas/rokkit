import Introduction from './introduction.svx'
import StringArrayExample from './string-array.svx'
import ObjectArrayExample from './object-array.svx'
import MappedAttributeExample from './mapped-attribute.svx'
import CustomComponentExample from './custom-component.svx'
import ComplexExample from './complex.svx'

console.log(typeof Introduction)

/**
 * @type {import('../types.js').TutorialPages}
 */
export const pages = [
	{
		title: 'Introduction',
		content: Introduction
	},
	{
		title: 'String Array',
		content: StringArrayExample
	},
	{
		title: 'Object Array',
		content: ObjectArrayExample
	},
	{
		title: 'Mapped Attributes',
		content: MappedAttributeExample
	},
	{
		title: 'Custom Component',
		content: CustomComponentExample
	},
	{
		title: 'Complex Scenario',
		content: ComplexExample
	}
]
