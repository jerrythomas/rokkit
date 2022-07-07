import fs from 'fs'
import { beforeAll, describe, it } from 'vitest'
// import { timelapse, Data } from '../src/lib/timelapse'
// import { getSubscribedData } from './helpers'

describe('Timelapse', () => {
	beforeAll((suite) => {
		suite.input = JSON.parse(fs.readFileSync('./spec/fixtures/table.json'))
		suite.byDate = JSON.parse(fs.readFileSync('./spec/fixtures/by-date.json'))
		suite.simulated = JSON.parse(fs.readFileSync('./spec/fixtures/data.json'))
	})

	it('should generate timelapse groups', () => {
		// const input = context.meta.suite.input
		// const result = timelapse(input, 'date')
		// expect(result).toEqual(context.meta.suite.byDate)
		// result.map(({ value }) => expect(Object.keys(value)).not.includes('date'))
	})

	// it('should create a datatable', (context) => {
	// 	const input = context.meta.suite.input

	// 	let dt = new Data(input)
	// 	expect(getSubscribedData(dt.data)).toEqual([])
	// 	expect(dt.options).toEqual({
	// 		time: undefined,
	// 		group: undefined,
	// 		orient: undefined,
	// 		value: undefined,
	// 		rank: undefined,
	// 		defaults: { rank: 99 }
	// 	})

	// 	dt.apply()
	// 	dt = new Data(input, { time: 'year', group: 'name' })
	// 	dt.apply()
	// 	console.log(JSON.stringify(getSubscribedData(dt.data)))
	// })
})

// timelapse by year scatter plot age by age group
// timelapse by year violin plot age by age group
// race by year bar plot age by name
// race by year bar plot bullets by name
