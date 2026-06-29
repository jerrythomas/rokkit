import { describe, it, expect } from 'vitest'
// skipcq: JS-C1003 - Importing all components for verification
import * as mocks from '../../src/mocks'

describe('mocks', () => {
	it('should contain all exported mocks', () => {
		expect(Object.keys(mocks)).toEqual([
			'matchMediaMock',
			'updateMedia',
			'elementsWithSize',
			'mixedSizeElements',
			'getMockNode',
			'createNestedElement',
			'mockFormRequestSubmit'
		])
	})

	it('document.execCommand returns false (JSDOM no-op polyfill)', () => {
		// index.js installs this if JSDOM does not have execCommand; call it
		// to exercise the installed function body (100% function coverage).
		if (typeof document !== 'undefined' && typeof document.execCommand === 'function') {
			expect(document.execCommand('copy')).toBe(false)
		}
	})

	it('HTMLElement.prototype.scrollTo is callable (JSDOM no-op polyfill)', () => {
		// index.js installs scrollTo if JSDOM lacks it; calling it exercises the
		// installed arrow-function body.
		const el = document.createElement('div')
		expect(() => el.scrollTo(0, 0)).not.toThrow()
	})
})
