import { List } from '@rokkit/core'
import PersonCard from '../PersonCard.svelte'
import { snippet } from '$lib/snippet'
import StringArray from './StringArray.svx'
import ObjectArray from './ObjectArray.svx'
import CustomComponent from './CustomComponent.svx'
import Introduction from './Introduction.svx'
import MappedAttributes from './MappedAttribute.svx'
// import Complex from './Complex.svx'

const name = 'List'
const component = List
const refs = [{ source: '@rokkit/core', items: ['List'] }]

const skin = 'yellow-orange'
/** @type {Array<import('$lib/types').Sample>} */
const examples = [
	{
		article: Introduction
	},
	{
		// title: 'String Array',
		// summary: 'A list can be created with an array of strings.',
		article: StringArray,
		// skin: 'yellow-orange',
		component,
		refs,
		props: {
			items: ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5']
		}
	},
	{
		// title: 'Object Array',
		// summary:
		// 	'List can also be created using an array of objects. This allows you to add images and icons also.',
		article: ObjectArray,
		component,
		refs,
		props: {
			items: [
				{ text: 'John', image: 'https://shorturl.at/pOTY4' },
				{ text: 'Jane', image: 'https://shorturl.at/bfqIO' }
			]
		}
	},
	{
		// title: 'With Mapping',
		// summary:
		// 	'When your data does not match the structure that list expects, you can provide a mapping for the fields to be used.',
		article: MappedAttributes,
		component,
		refs,
		props: {
			fields: { text: 'name', image: 'profile' },
			items: [
				{ name: 'John', profile: 'https://shorturl.at/pOTY4' },
				{ name: 'Jane', profile: 'https://shorturl.at/bfqIO' }
			]
		}
	},
	{
		// title: 'Custom Component',
		// summary:
		// 'For maximum flexibility, List can also use custom components. Custom components will get data via the property named `content`.',
		article: CustomComponent,
		component,
		refs: [...refs, { source: './PersonCard.svelte', items: 'PersonCard' }],
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
		declarations: {
			using: 'let using = { default: PersonCard }'
		}
	}
].map((page) => ({
	...page,
	code: page.component ? snippet(name, page) : null
}))

export default {
	name,
	skin,
	examples
}
