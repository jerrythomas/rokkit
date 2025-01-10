import { describe, it, expect } from 'vitest'
// skipcq: JS-C1003 - Importing all components for verification
import * as functions from '../src/index.js'

describe('utils', () => {
	it('should contain all exported functions', () => {
		expect(Object.keys(functions)).toEqual([
			'defaultColors',
			'syntaxColors',
			'shades',
			'defaultPalette',
			'defaultFields',
			'defaultIcons',
			'defaultOptions',
			'defaultKeyMap',
			'defaultThemeMapping',
			'stateIconsFromNames',
			'defaultStateIcons',
			'getComponent',
			'getIcon',
			'getValue',
			'getText',
			'getAttribute',
			'getFormattedText',
			'hasChildren',
			'isExpanded',
			'isNested',
			'getClosestAncestorWithAttribute',
			'noop',
			'id',
			'isObject',
			'toString',
			'iconShortcuts',
			'scaledPath'
		])
	})
})
