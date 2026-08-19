import { describe, it, expect } from 'vitest'
import { toSparklineProps, type SparklineSettings } from '$lib/koan/demos/sparkline/mapping'

const base: SparklineSettings = { type: 'bar', baseline: false, highlight: 'none', trend: 'none' }

describe('toSparklineProps', () => {
	it('maps baseline off to undefined (never false)', () => {
		const props = toSparklineProps({ ...base, baseline: false })
		expect(props.baseline).toBeUndefined()
	})

	it('maps baseline on to the number 0', () => {
		expect(toSparklineProps({ ...base, baseline: true }).baseline).toBe(0)
	})

	it('expands highlight modes to component tokens', () => {
		expect(toSparklineProps({ ...base, highlight: 'none' }).highlight).toBeUndefined()
		expect(toSparklineProps({ ...base, highlight: 'minmax' }).highlight).toEqual(['min', 'max'])
		expect(toSparklineProps({ ...base, highlight: 'last' }).highlight).toEqual(['last'])
		expect(toSparklineProps({ ...base, highlight: 'all' }).highlight).toEqual(['min', 'max', 'last'])
	})

	it('passes trend methods through, omitting none', () => {
		expect(toSparklineProps({ ...base, trend: 'none' }).trend).toBeUndefined()
		expect(toSparklineProps({ ...base, trend: 'avg' }).trend).toBe('avg')
		expect(toSparklineProps({ ...base, trend: 'linear' }).trend).toBe('linear')
	})

	it('passes type through unchanged', () => {
		expect(toSparklineProps({ ...base, type: 'area' }).type).toBe('area')
	})
})
