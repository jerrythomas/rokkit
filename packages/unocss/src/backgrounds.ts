import type { Preset, Rule } from 'unocss'

const GRAPH_PAPER_RULE: Rule = [
	'bg-graph-paper',
	{
		'background-image': [
			'linear-gradient(var(--graph-paper-color, currentColor) var(--major-grid, 0.5px), transparent var(--major-grid, 0.5px))',
			'linear-gradient(90deg, var(--graph-paper-color, currentColor) var(--major-grid, 0.5px), transparent var(--major-grid, 0.5px))',
			'linear-gradient(var(--graph-paper-color, currentColor) var(--minor-grid, 0.5px), transparent var(--minor-grid, 0.5px))',
			'linear-gradient(90deg, var(--graph-paper-color, currentColor) var(--minor-grid, 0.5px), transparent var(--minor-grid, 0.5px))'
		].join(','),
		'background-size': [
			'var(--size, calc(5 * var(--unit, 0.5rem))) var(--size, calc(5 * var(--unit, 0.5rem)))',
			'var(--size, calc(5 * var(--unit, 0.5rem))) var(--size, calc(5 * var(--unit, 0.5rem)))',
			'var(--unit, 0.5rem) var(--unit, 0.5rem)',
			'var(--unit, 0.5rem) var(--unit, 0.5rem)'
		].join(','),
		'background-position': [
			'calc(-1 * var(--minor-grid, 0.5px)) calc(-1 * var(--minor-grid, 0.5px))',
			'calc(-1 * var(--minor-grid, 0.5px)) calc(-1 * var(--minor-grid, 0.5px))',
			'calc(-1 * var(--minor-grid, 0.5px)) calc(-1 * var(--minor-grid, 0.5px))',
			'calc(-1 * var(--minor-grid, 0.5px)) calc(-1 * var(--minor-grid, 0.5px))'
		].join(',')
	}
]

const GRID_PAPER_RULE: Rule = [
	'bg-grid-paper',
	{
		'background-image': [
			'linear-gradient(var(--grid-paper-color, currentColor) var(--grid-line, 0.5px), transparent var(--grid-line, 0.5px))',
			'linear-gradient(90deg, var(--grid-paper-color, currentColor) var(--grid-line, 0.5px), transparent var(--grid-line, 0.5px))'
		].join(','),
		'background-size': 'var(--unit, 0.5rem) var(--unit, 0.5rem)',
		'background-position': [
			'calc(-1 * var(--grid-line, 0.5px)) calc(-1 * var(--grid-line, 0.5px))',
			'calc(-1 * var(--grid-line, 0.5px)) calc(-1 * var(--grid-line, 0.5px))'
		].join(',')
	}
]

const RULED_PAPER_RULE: Rule = [
	'bg-ruled-paper',
	{
		'background-image':
			'linear-gradient(var(--ruled-paper-color, currentColor) var(--rule-size, 0.5px), transparent var(--rule-size, 0.5px))',
		'background-size': '100% var(--unit, 1.5rem)',
		'background-position': '0 calc(-1 * var(--rule-size, 0.5px))'
	}
]

const PATTERN_DIAGONAL_RULE: Rule = [
	'bg-pattern-diagonal',
	{
		'background-image':
			'repeating-linear-gradient(45deg, var(--pattern-color, currentColor) 0, var(--pattern-color, currentColor) var(--pattern-line, 0.5px), var(--pattern-fill, transparent) var(--pattern-line, 0.5px), var(--pattern-fill, transparent) var(--pattern-size, 3mm))'
	}
]

const PATTERN_DIAGONAL_REVERSE_RULE: Rule = [
	'bg-pattern-diagonal-reverse',
	{
		'background-image':
			'repeating-linear-gradient(-45deg, var(--pattern-color, currentColor) 0, var(--pattern-color, currentColor) var(--pattern-line, 0.5px), var(--pattern-fill, transparent) var(--pattern-line, 0.5px), var(--pattern-fill, transparent) var(--pattern-size, 3mm))'
	}
]

const PATTERN_VERTICAL_RULE: Rule = [
	'bg-pattern-vertical',
	{
		'background-image':
			'repeating-linear-gradient(90deg, var(--pattern-color, currentColor) 0, var(--pattern-color, currentColor) var(--pattern-line, 0.5px), var(--pattern-fill, transparent) var(--pattern-line, 0.5px), var(--pattern-fill, transparent) var(--pattern-size, 3mm))'
	}
]

const PATTERN_HORIZONTAL_RULE: Rule = [
	'bg-pattern-horizontal',
	{
		'background-image':
			'repeating-linear-gradient(0deg, var(--pattern-color, currentColor) 0, var(--pattern-color, currentColor) var(--pattern-line, 0.5px), var(--pattern-fill, transparent) var(--pattern-line, 0.5px), var(--pattern-fill, transparent) var(--pattern-size, 3mm))'
	}
]

const PATTERN_CROSSHATCH_RULE: Rule = [
	'bg-pattern-crosshatch',
	{
		'background-image':
			'repeating-linear-gradient(45deg, var(--pattern-color, currentColor) 0, var(--pattern-color, currentColor) var(--pattern-line, 0.5px), var(--pattern-fill, transparent) var(--pattern-line, 0.5px), var(--pattern-fill, transparent) var(--pattern-size, 3mm)), repeating-linear-gradient(-45deg, var(--pattern-color, currentColor) 0, var(--pattern-color, currentColor) var(--pattern-line, 0.5px), var(--pattern-fill, transparent) var(--pattern-line, 0.5px), var(--pattern-fill, transparent) var(--pattern-size, 3mm))'
	}
]

const PATTERN_DOTS_RULE: Rule = [
	'bg-pattern-dots',
	{
		'background-image':
			'radial-gradient(circle, var(--pattern-color, currentColor) var(--pattern-line, 0.5px), var(--pattern-fill, transparent) var(--pattern-line, 0.5px))',
		'background-size': 'var(--pattern-size, 3mm) var(--pattern-size, 3mm)'
	}
]

const PATTERN_CHECKER_RULE: Rule = [
	'bg-pattern-checker',
	{
		'background-image':
			'linear-gradient(45deg, var(--pattern-color, currentColor) 25%, transparent 25%), linear-gradient(-45deg, var(--pattern-color, currentColor) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, var(--pattern-color, currentColor) 75%), linear-gradient(-45deg, transparent 75%, var(--pattern-color, currentColor) 75%)',
		'background-color': 'var(--pattern-fill, transparent)',
		'background-size': 'calc(2 * var(--pattern-size, 3mm)) calc(2 * var(--pattern-size, 3mm))',
		'background-position':
			'0 0, 0 var(--pattern-size, 3mm), var(--pattern-size, 3mm) calc(-1 * var(--pattern-size, 3mm)), calc(-1 * var(--pattern-size, 3mm)) 0'
	}
]

export function presetBackgrounds(): Preset {
	return {
		name: 'rokkit-backgrounds',
		rules: [
			GRAPH_PAPER_RULE,
			GRID_PAPER_RULE,
			RULED_PAPER_RULE,
			PATTERN_DIAGONAL_RULE,
			PATTERN_DIAGONAL_REVERSE_RULE,
			PATTERN_VERTICAL_RULE,
			PATTERN_HORIZONTAL_RULE,
			PATTERN_CROSSHATCH_RULE,
			PATTERN_DOTS_RULE,
			PATTERN_CHECKER_RULE
		]
	}
}
