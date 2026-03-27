import masterPalette from '../palette.json'
import { defaultPreset } from '../preset.js'
import { PATTERN_ORDER } from '../brewing/patterns.js'
import { SYMBOL_ORDER } from '../brewing/symbols.js'

/** @typedef {{ colors: string[], patterns: string[], symbols: string[] }} PlotPreset */

export const DEFAULT_PRESET = {
	colors: defaultPreset.colors.map((name) => {
		const group = masterPalette[name]
		return group?.[defaultPreset.shades.light.fill] ?? '#888'
	}),
	patterns: PATTERN_ORDER,
	symbols: SYMBOL_ORDER
}

export const ACCESSIBLE_PRESET = {
	colors: ['#66c2a5', '#fc8d62', '#8da0cb', '#e78ac3', '#a6d854', '#ffd92f', '#e5c494', '#b3b3b3'],
	patterns: PATTERN_ORDER,
	symbols: SYMBOL_ORDER
}

export const PRINT_PRESET = {
	colors: ['#f0f0f0', '#bdbdbd', '#969696', '#737373', '#525252', '#252525', '#000000'],
	patterns: [
		'CrossHatch',
		'DiagonalLines',
		'Dots',
		'Brick',
		'Waves',
		'Triangles',
		'HorizontalLines'
	],
	symbols: SYMBOL_ORDER
}

const BUILT_IN_PRESETS = {
	default: DEFAULT_PRESET,
	accessible: ACCESSIBLE_PRESET,
	print: PRINT_PRESET
}

export function resolvePreset(name, helpers = {}) {
	let resolved = null

	if (name && BUILT_IN_PRESETS[name]) {
		resolved = BUILT_IN_PRESETS[name]
	} else if (name && helpers?.presets?.[name]) {
		resolved = helpers.presets[name]
	} else if (name) {
		// eslint-disable-next-line no-console
		console.warn(
			`[Plot] Unknown preset "${name}" — falling back to default. Add it to helpers.presets to suppress this warning.`
		)
		resolved = DEFAULT_PRESET
	} else if (helpers?.preset) {
		resolved = helpers.preset
	} else {
		resolved = DEFAULT_PRESET
	}

	return {
		colors: resolved.colors ?? DEFAULT_PRESET.colors,
		patterns: resolved.patterns ?? DEFAULT_PRESET.patterns,
		symbols: resolved.symbols ?? DEFAULT_PRESET.symbols
	}
}
