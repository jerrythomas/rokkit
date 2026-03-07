// @ts-nocheck
import type { Preset } from 'unocss'

const GRAPH_PAPER_RULE = [
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
] as const

const GRID_PAPER_RULE = [
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
] as const

const RULED_PAPER_RULE = [
	'bg-ruled-paper',
	{
		'background-image':
			'linear-gradient(var(--ruled-paper-color, currentColor) var(--rule-size, 0.5px), transparent var(--rule-size, 0.5px))',
		'background-size': '100% var(--unit, 1.5rem)',
		'background-position': '0 calc(-1 * var(--rule-size, 0.5px))'
	}
] as const

const PATTERN_DIAGONAL_RULE = [
	'bg-pattern-diagonal',
	{
		'background-image':
			'repeating-linear-gradient(45deg, var(--fg-pattern, currentColor) 0, var(--fg-pattern, currentColor) var(--pattern-line, 1.5px), var(--bg-pattern, transparent) var(--pattern-line, 1.5px), var(--bg-pattern, transparent) var(--pattern-size, 8px))'
	}
] as const

const PATTERN_DIAGONAL_REVERSE_RULE = [
	'bg-pattern-diagonal-reverse',
	{
		'background-image':
			'repeating-linear-gradient(-45deg, var(--fg-pattern, currentColor) 0, var(--fg-pattern, currentColor) var(--pattern-line, 1.5px), var(--bg-pattern, transparent) var(--pattern-line, 1.5px), var(--bg-pattern, transparent) var(--pattern-size, 8px))'
	}
] as const

const PATTERN_VERTICAL_RULE = [
	'bg-pattern-vertical',
	{
		'background-image':
			'repeating-linear-gradient(90deg, var(--fg-pattern, currentColor) 0, var(--fg-pattern, currentColor) var(--pattern-line, 1.5px), var(--bg-pattern, transparent) var(--pattern-line, 1.5px), var(--bg-pattern, transparent) var(--pattern-size, 8px))'
	}
] as const

const PATTERN_HORIZONTAL_RULE = [
	'bg-pattern-horizontal',
	{
		'background-image':
			'repeating-linear-gradient(0deg, var(--fg-pattern, currentColor) 0, var(--fg-pattern, currentColor) var(--pattern-line, 1.5px), var(--bg-pattern, transparent) var(--pattern-line, 1.5px), var(--bg-pattern, transparent) var(--pattern-size, 8px))'
	}
] as const

const PATTERN_CROSSHATCH_RULE = [
	'bg-pattern-crosshatch',
	{
		'background-image':
			'repeating-linear-gradient(45deg, var(--fg-pattern, currentColor) 0, var(--fg-pattern, currentColor) var(--pattern-line, 1px), var(--bg-pattern, transparent) var(--pattern-line, 1px), var(--bg-pattern, transparent) var(--pattern-size, 8px)), repeating-linear-gradient(-45deg, var(--fg-pattern, currentColor) 0, var(--fg-pattern, currentColor) var(--pattern-line, 1px), var(--bg-pattern, transparent) var(--pattern-line, 1px), var(--bg-pattern, transparent) var(--pattern-size, 8px))'
	}
] as const

const PATTERN_DOTS_RULE = [
	'bg-pattern-dots',
	{
		'background-image':
			'radial-gradient(circle, var(--fg-pattern, currentColor) var(--pattern-line, 1.5px), var(--bg-pattern, transparent) var(--pattern-line, 1.5px))',
		'background-size': 'var(--pattern-size, 8px) var(--pattern-size, 8px)'
	}
] as const

const PATTERN_CHECKER_RULE = [
	'bg-pattern-checker',
	{
		'background-image':
			'linear-gradient(45deg, var(--fg-pattern, currentColor) 25%, transparent 25%), linear-gradient(-45deg, var(--fg-pattern, currentColor) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, var(--fg-pattern, currentColor) 75%), linear-gradient(-45deg, transparent 75%, var(--fg-pattern, currentColor) 75%)',
		'background-color': 'var(--bg-pattern, transparent)',
		'background-size':
			'calc(2 * var(--pattern-size, 8px)) calc(2 * var(--pattern-size, 8px))',
		'background-position':
			'0 0, 0 var(--pattern-size, 8px), var(--pattern-size, 8px) calc(-1 * var(--pattern-size, 8px)), calc(-1 * var(--pattern-size, 8px)) 0'
	}
] as const

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
