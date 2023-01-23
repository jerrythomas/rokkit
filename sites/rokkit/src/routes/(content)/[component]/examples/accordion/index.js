import { Accordion } from '@rokkit/core'
// import PersonCard from './PersonCard.svelte'
// import { snippet } from '$lib/snippet'
import { nestedItems, withMapping } from './data'
import NestedArray from './NestedArray.svx'
import WithMapping from './WithMapping.svx'
import States from './States.svx'
import AutoClose from './AutoClose.svx'

// const wrapperClass = 'overflow-hidden'
const component = Accordion
const refs = [{ source: '@rokkit/core', items: ['Accordion'] }]

/** @type {import('$lib/types').Tutorial} */
export default {
	name: 'Accordion',
	skin: 'violet-indigo',
	slides: [
		{
			notes: NestedArray,
			component,
			props: {
				items: nestedItems
			},
			snippet: {
				refs
			}
		},
		{
			notes: WithMapping,
			component,
			props: {
				fields: { text: 'name', image: 'photo' },
				items: withMapping
			},
			snippet: { refs }
		},
		{
			notes: States,
			component,
			// refs,
			// wrapperClass,
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
			snippet: {
				refs
				// defs: {
				// using: 'let using = { default: PersonCard }'
				// }
			}
		},
		{
			notes: AutoClose,
			component,
			// refs,
			// wrapperClass,
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
			},
			snippet: { refs }
		}
	]
}
// .map((page) => ({
// 	...page,
// 	code: page.component ? snippet(name, page) : null
// }))

// export default {
// 	name,
// 	skin: 'purple-indigo',
// 	examples
// }
