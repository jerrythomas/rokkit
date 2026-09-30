import { describe, it, expect } from 'vitest'
import * as utils from '../src/utils.js'
import * as dom from '../src/dom.js'
import * as values from '../src/values.js'
import * as icons from '../src/icons.js'
import * as keys from '../src/keys.js'
import * as snippets from '../src/snippets.js'
import * as oklch from '../src/oklch.js'

/**
 * utils.js is a barrel over single-job modules. Its export list is public API
 * (`export * from './utils.js'` in the package index, and `@rokkit/core/src/utils.js`), so it is
 * pinned here: a module split must not drop or rename a name.
 */
const MODULES = {
	dom: [dom, ['detectDirection', 'isRTL', 'getClosestAncestorWithAttribute']],
	values: [values, ['noop', 'id', 'isObject', 'toString', 'scaledPath']],
	icons: [icons, ['iconShortcuts', 'isIconClass', 'getImage']],
	keys: [keys, ['getKeyFromPath', 'getPathFromKey']],
	snippets: [snippets, ['getSnippet', 'resolveSnippet']],
	oklch: [oklch, ['hex2rgb', 'hex2oklch', 'oklch2hex']]
}

describe('utils barrel', () => {
	it('exports exactly the names it always has', () => {
		expect(Object.keys(utils).sort()).toEqual([
			'detectDirection',
			'getClosestAncestorWithAttribute',
			'getImage',
			'getKeyFromPath',
			'getPathFromKey',
			'getSnippet',
			'hex2oklch',
			'hex2rgb',
			'iconShortcuts',
			'id',
			'isIconClass',
			'isObject',
			'isRTL',
			'noop',
			'oklch2hex',
			'resolveSnippet',
			'scaledPath',
			'toString'
		])
	})

	it.each(Object.entries(MODULES))('re-exports the %s module unchanged', (_name, [module, names]) => {
		expect(Object.keys(module).sort()).toEqual([...names].sort())
		for (const name of names) expect(utils[name]).toBe(module[name])
	})
})
