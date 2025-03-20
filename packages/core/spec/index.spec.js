import { describe, it, expect } from 'vitest'
// skipcq: JS-C1003 - Importing all components for verification
import * as functions from '../src/index.js'

describe('@rokkit/core', () => {
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
			'getClosestAncestorWithAttribute',
			'noop',
			'id',
			'isObject',
			'toString',
			'iconShortcuts',
			'scaledPath',
			'getKeyFromPath',
			'getPathFromKey',
			'getSnippet',
			'flattenNestedList',
			'findValueFromPath',
			'toInitCapCase',
			'toPascalCase',
			'toHyphenCase',
			'compareStrings',
			'sortByParts',
			'uniqueId',
			'compact',
			'toHexString',
			'shadesOf',
			'stateColors',
			'themeColors',
			'contrastColors',
			'themeRules',
			'FieldMapper',
			'getItemAtIndex',
			'getIndexForItem',
			'createEmitter',
			'getLineTypes',
			'weekdays',
			'getCalendarDays',
			'generateTicks',
			'getValue'
		])
	})
})
