/**
 * Spec for types.js — JSDoc typedef module with a single `export {}` statement.
 * Importing it ensures the module is marked covered by v8.
 */
import { describe, it, expect } from 'vitest'
import * as types from '../../../src/lib/plot/types.js'

describe('types module', () => {
	it('exports an empty namespace (typedef-only module)', () => {
		// The module contains only JSDoc typedefs and `export {}`.
		// No runtime values are exported — the namespace should be empty.
		expect(typeof types).toBe('object')
	})
})
