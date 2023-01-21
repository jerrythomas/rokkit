import { Accordion } from '@rokkit/core'
// import PersonCard from './PersonCard.svelte'
import { snippet } from '$lib/snippet'
import { nestedItems, withMapping } from './data'

const wrapperClass = 'h-full overflow-hidden'
const name = 'Accordion'
const component = Accordion
const refs = [{ source: '@rokkit/core', items: ['Accordion'] }]

/** @type {Array<import('$lib/types').Sample>} */
export default [
	{
		title: 'Nested Object Array',
		summary: 'Accordion data needs to be a nested object array.',
		component,
		refs,
		class: wrapperClass,
		props: {
			items: nestedItems
		}
	},
	{
		title: 'With Mapping ',
		summary:
			'When your data does not match the structure that list expects, you can provide a mapping for the fields to be used.',
		component,
		refs,
		class: wrapperClass,
		props: {
			fields: { text: 'name', image: 'photo' },
			items: withMapping
		}
	},
	{
		title: 'Open/Close States',
		summary: 'You can control which items in the accordion are open/closed.',
		component,
		refs,
		class: wrapperClass,
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
		title: 'AutoClose',
		summary: 'Keep only one item open.',
		component,
		refs,
		class: wrapperClass,
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
].map((page) => ({ ...page, code: snippet(name, page) }))
