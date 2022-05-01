import fs from 'fs'
import yaml from 'js-yaml'
import { nest } from 'd3-collection'

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

export const add = yaml.load(fs.readFileSync('spec/fixtures/list/add.yml'))
export const remove = yaml.load(
	fs.readFileSync('spec/fixtures/list/remove.yml')
)

export const modify = yaml.load(
	fs.readFileSync('spec/fixtures/list/modify.yml')
)
export const altKey = yaml.load(
	fs.readFileSync('spec/fixtures/list/alt-key.yml')
)
export const sorting = yaml.load(fs.readFileSync('spec/fixtures/list/sort.yml'))
