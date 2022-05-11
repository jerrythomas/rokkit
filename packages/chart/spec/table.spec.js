import fs from 'fs'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { getSubscribedData } from './helpers'
import { table } from '../src/lib/table'

describe('Utility functions', () => {
	beforeAll((suite) => {
		suite.input = JSON.parse(fs.readFileSync('./spec/fixtures/table.json'))
		suite.byTeam = JSON.parse(fs.readFileSync('./spec/fixtures/by-team.json'))
	})

	it('should create table for data', (context) => {
		const input = context.meta.suite.input
		const t = table(input)

		expect(t.originalData).toEqual(input)
		expect(t.options).toEqual({
			filters: [],
			groupBy: undefined,
			numericFields: ['score', 'pct'],
			sortBy: undefined,
			stringFields: ['date', 'team', 'group'],
			timelapseBy: undefined
		})
		t.apply()
		expect(getSubscribedData(t.data)).toEqual(input)
	})

	it('should set and apply grouping', (context) => {
		const input = context.meta.suite.input
		let t = table(input, { groupBy: 'group' })
		expect(t.options).toEqual({
			filters: [],
			groupBy: 'group',
			numericFields: ['score', 'pct'],
			sortBy: undefined,
			stringFields: ['date', 'team', 'group'],
			timelapseBy: undefined
		})
		expect(getSubscribedData(t.data)).toEqual([])
		t.apply()
		expect(getSubscribedData(t.data)).toEqual(context.meta.suite.byTeam)
	})
	it('should set and apply sorting', (context) => {})

	it('should set and apply filters', (context) => {
		let data = context.meta.suite.input
		let t = table(data)

		expect(t.originalData).toEqual(data)
		expect(t.options).toEqual({
			filters: [],
			groupBy: undefined,
			numericFields: ['score', 'pct'],
			sortBy: undefined,
			stringFields: ['date', 'team', 'group'],
			timelapseBy: undefined
		})
		t.addFilter('group', 'Alpha').apply()
		expect(t.options.filters).toEqual([{ attribute: 'group', value: 'Alpha' }])
		expect(getSubscribedData(t.data)).toEqual(
			data.filter((d) => d.group === 'Alpha')
		)

		t.addFilter('score', 1).apply()
		expect(t.options.filters).toEqual([
			{ attribute: 'group', value: 'Alpha' },
			{ attribute: 'score', value: 1 }
		])
		expect(getSubscribedData(t.data)).toEqual([
			{
				date: '2020-01-01',
				team: 'x',
				group: 'Alpha',
				score: 1,
				pct: '10'
			}
		])

		t.clearFilters().apply()
		expect(t.options.filters).toEqual([])
		expect(getSubscribedData(t.data)).toEqual(data)

		t.addFilter('score', [1, 2]).apply()
		expect(t.options.filters).toEqual([{ attribute: 'score', value: [1, 2] }])
		expect(getSubscribedData(t.data)).toEqual([
			{
				date: '2020-01-01',
				team: 'x',
				group: 'Alpha',
				score: 1,
				pct: '10'
			},
			{
				date: '2020-01-01',
				team: 'y',
				group: 'Alpha',
				score: 2,
				pct: '20'
			},
			{ date: '2020-01-01', team: 'x', group: 'Beta', score: 1, pct: '10' },
			{ date: '2020-01-01', team: 'y', group: 'Beta', score: 2, pct: '20' },
			{
				date: '2020-02-01',
				team: 'x',
				group: 'Alpha',
				score: 2,
				pct: '20'
			}
		])
	})
})
