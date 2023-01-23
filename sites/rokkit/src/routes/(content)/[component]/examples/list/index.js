import { List } from '@rokkit/core'
import PersonCard from '../PersonCard.svelte'

// import StringArray from './StringArray.svx'
import ObjectArray from './ObjectArray.svx'
import CustomComponent from './CustomComponent.svx'
import Introduction from './Introduction.svx'
import MappedAttributes from './MappedAttribute.svx'
// import Complex from './Complex.svx'

const component = List
const refs = [{ source: '@rokkit/core', items: ['List'] }]
const exclusions = []

/** @type {import('$lib/types').Tutorial} */
export default {
	name: 'List',
	skin: 'yellow-orange',
	slides: [
		{
			notes: Introduction,
			component,
			props: {
				items: ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5']
			},
			snippet: {
				refs,
				exclusions
			}
		},
		{
			notes: ObjectArray,
			component,
			props: {
				items: [
					{ text: 'John', image: 'https://shorturl.at/pOTY4' },
					{ text: 'Jane', image: 'https://shorturl.at/bfqIO' }
				]
			},

			snippet: {
				refs,
				exclusions
			}
		},
		{
			notes: MappedAttributes,
			component,
			props: {
				fields: { text: 'name', image: 'profile' },
				items: [
					{ name: 'John', profile: 'https://shorturl.at/pOTY4' },
					{ name: 'Jane', profile: 'https://shorturl.at/bfqIO' }
				]
			},

			snippet: {
				refs,
				exclusions
			}
		},
		{
			notes: CustomComponent,
			component,

			props: {
				using: { default: PersonCard },
				items: [
					{
						name: 'John',
						age: 30,
						gender: 'Male',
						profile: 'https://shorturl.at/pOTY4'
					},
					{
						name: 'Jane',
						age: 25,
						gender: 'Female',
						profile: 'https://shorturl.at/bfqIO'
					}
				]
			},

			snippet: {
				defs: {
					using: 'let using = { default: PersonCard }'
				},
				refs: [...refs, { source: './PersonCard.svelte', items: 'PersonCard' }],
				exclusions
			}
		}
	]
}
// .map((page) => ({
// 	...page,
// 	code: page.component ? snippet(name, page) : null
// }))

// export default {
// 	name,
// 	skin,
// 	slides
// }
