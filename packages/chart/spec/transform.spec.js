import fs from 'fs'
import yaml from 'js-yaml'
import { beforeAll, describe, expect, it } from 'vitest'
import { tweenable } from '../src/lib/transform'

describe('Animation transform', () => {
	beforeAll((suite) => {
		suite.input = JSON.parse(fs.readFileSync('./spec/fixtures/table.json'))
		suite.groups = yaml.load(
			fs.readFileSync('./spec/fixtures/table/groups.yaml')
		)
		suite.nested = yaml.load(
			fs.readFileSync('./spec/fixtures/table/nested.yaml')
		)
	})

	it('should return data without transforming', (context) => {
		const input = context.meta.suite.input
		let result = tweenable().transform(input)
		expect(result).toEqual(input)
		result = tweenable().group(['name']).transform(input)
		expect(result).toEqual(input)
		result = tweenable().key('name').transform(input)
		expect(result).toEqual(input)
		result = tweenable().key('name').sort().group(['gender']).transform(input)
		expect(result).toEqual(input)
	})

	it('should create flat groups', (context) => {
		const input = context.meta.suite.input
		const expected = context.meta.suite.groups

		let result = tweenable().rollup('score').group(['team']).transform(input)
		expect(result).toEqual(expected['team-score'])

		result = tweenable().rollup('score').group(['group']).transform(input)
		expect(result).toEqual(expected['group-score'])

		result = tweenable()
			.rollup('score')
			.group(['group', 'team'])
			.transform(input)
		expect(result).toEqual(expected['group-team-score'])

		result = tweenable().rollup('pct').group(['group', 'team']).transform(input)
		expect(result).toEqual(expected['group-team-pct'])
	})

	it('should create nested arrays', (context) => {
		const input = context.meta.suite.input
		const expected = context.meta.suite.nested

		let result = tweenable()
			.rollup('score')
			.group(['team'])
			.key('date')
			.transform(input)
		// console.log(JSON.stringify(result, null, 2))
		expect(result).toEqual(expected['date-team-score'])

		result = tweenable()
			.rollup('score')
			.group(['group', 'team'])
			.key('date')
			.transform(input)
		expect(result).toEqual(expected['date-group-team-score'])
	})
})
