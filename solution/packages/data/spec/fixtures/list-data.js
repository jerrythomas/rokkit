import { nest } from 'd3-collection'
export { default as add } from './list/add'
export { default as remove } from './list/remove'
export { default as modify } from './list/modify'
export { default as altKey } from './list/altkey'
export { default as sorting } from './list/sort'

export const data = [
	{ id: 2, name: 'Beta', lookup_id: 1 },
	{ id: 3, name: 'Charlie', lookup_id: 1 },
	{ id: 1, name: 'Alpha', lookup_id: 1 },
	{ id: 4, name: 'Delta', lookup_id: 2 },
	{ id: 5, name: 'Echo', lookup_id: 2 }
]
export const sorted = [
	{ id: 1, name: 'Alpha', lookup_id: 1 },
	{ id: 2, name: 'Beta', lookup_id: 1 },
	{ id: 3, name: 'Charlie', lookup_id: 1 },
	{ id: 4, name: 'Delta', lookup_id: 2 },
	{ id: 5, name: 'Echo', lookup_id: 2 }
]
export const lookup = { 1: 'One', 2: 'Two', 3: 'Three' }
export const grouped = nest()
	.key((d) => d.lookup_id)
	.entries(data)
	.map(({ key, values }) => ({
		key,
		name: lookup[key],
		data: values
	}))

export const sortedAndGrouped = nest()
	.key((d) => d.lookup_id)
	.entries(sorted)
	.map(({ key, values }) => ({
		key,
		name: lookup[key],
		data: values
	}))

export const searchResult = [{ id: 1, name: 'Alpha', lookup_id: 1 }]
export const groupSearchResult = [
	{
		key: '1',
		name: 'One',
		data: [{ id: 1, name: 'Alpha', lookup_id: 1 }]
	}
]
