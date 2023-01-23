import { Accordion } from '@rokkit/core'
// import PersonCard from './PersonCard.svelte'
import { snippet } from '$lib/snippet'
import { nestedItems, withMapping } from './data'
import NestedArray from './NestedArray.svx'
import WithMapping from './WithMapping.svx'
import States from './States.svx'
import AutoClose from './AutoClose.svx'

const wrapperClass = 'overflow-hidden'
const name = 'Accordion'
const component = Accordion
const refs = [{ source: '@rokkit/core', items: ['Accordion'] }]

/** @type {Array<import('$lib/types').Sample>} */
const examples = [
	{
		article: NestedArray,
		component,
		refs,
		wrapperClass,
		props: {
			items: nestedItems
		}
	},
	{
		article: WithMapping,
		component,
		refs,
		wrapperClass,
		props: {
			fields: { text: 'name', image: 'photo' },
			items: withMapping
		}
	},
	{
		article: States,
		component,
		refs,
		wrapperClass,
		props: {
			// using: { default: PersonCard },
			items: [
				{
					text: 'John',
					_open: true,
					data: [
						{ id: 1, text: 'Smith' },
						{ id: 2, text: 'Doe' }
					]
				},
				{
					text: 'Jane',
					_open: false,
					data: [
						{ id: 4, text: 'Smith' },
						{ id: 5, text: 'Doe' }
					]
				},
				{
					text: 'June',
					_open: true,
					data: [
						{ id: 6, text: 'Smith' },
						{ id: 7, text: 'Doe' }
					]
				}
			]
		},
		declarations: {
			// using: 'let using = { default: PersonCard }'
		}
	},
	{
		article: AutoClose,
		component,
		refs,
		wrapperClass,
		props: {
			autoClose: true,
			class: 'gap-1',
			items: [
				{
					text: 'John',
					_open: true,
					data: [
						{ id: 1, text: 'Smith' },
						{ id: 2, text: 'Doe' }
					]
				},
				{
					text: 'Jane',
					_open: false,
					data: [
						{ id: 4, text: 'Smith' },
						{ id: 5, text: 'Doe' }
					]
				}
			]
		}
	}
].map((page) => ({
	...page,
	code: page.component ? snippet(name, page) : null
}))

export default {
	name,
	skin: 'purple-indigo',
	examples
}
