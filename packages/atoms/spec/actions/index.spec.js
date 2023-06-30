import { describe, it, expect } from 'vitest'
import * as actions from '../../src/actions'

describe('actions', () => {
	it('should contain all exported actions', () => {
		expect(Object.keys(actions)).toEqual([
			'fillable',
			'pannable',
			'navigable',
			'navigator',
			'dismissable',
			'themable',
			'swipeable'
		])
	})
})
