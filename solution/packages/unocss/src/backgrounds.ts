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

export function presetBackgrounds(): Preset {
	return {
		name: 'rokkit-backgrounds',
		rules: [GRAPH_PAPER_RULE]
	}
}
