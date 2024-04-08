import { describe, it, expect } from 'vitest'
import * as exported from '../src'

describe('library', () => {
	it('should export specific functions', () => {
		expect(Object.keys(exported)).toEqual(['getType', 'renamer', 'model', 'dataset', 'dataview'])
	})
})
