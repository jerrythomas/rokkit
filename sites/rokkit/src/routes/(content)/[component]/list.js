import { List } from '@rokkit/core'
import PersonCard from './PersonCard.svelte'
import { snippet } from './snippet'

const name = 'List'
const component = List
const refs = [{ source: '@rokkit/core', items: ['List'] }]

export const pages = [
	{
		title: 'String Array',
		summary: 'A list can be created with an array of strings.',
		component,
		refs,
		props: {
			items: ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5']
		}
	},
	{
		title: 'Object Array',
		summary: '',
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
		title: 'With Mapping',
		summary: '',
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
		title: 'Custom Component',
		summary: '',
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
].map((page) => ({ ...page, code: snippet(name, page) }))
