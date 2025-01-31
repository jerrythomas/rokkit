import { describe, it, expect } from 'vitest'
// skipcq: JS-C1003 - Importing all components for verification
import * as exported from '../src'

describe('library', () => {
	it('should export specific functions', () => {
		expect(Object.keys(exported)).toEqual(['typeOf', 'renamer', 'model', 'dataset', 'dataview'])
	})
})
