import { noop } from '@rokkit/core'

export const DEFAULT_EVENTS = {
	move: noop,
	select: noop,
	expand: noop,
	collapse: noop
}

export const VALID_DENSITIES = ['compact', 'comfortable', 'cozy']
export const VALID_MODES = ['light', 'dark']
/** @type {string[]} */
export const DEFAULT_STYLES = ['rokkit', 'minimal', 'material']

export const DEFAULT_VIBE_OPTIONS = {
	allowed: DEFAULT_STYLES,
	style: 'rokkit',
	mode: 'dark',
	density: 'comfortable'
}

export const DEFAULT_VIBE_PALETTE = {
	primary: '#007bff',
	secondary: '#6c757d',
	success: '#28a745',
	info: '#17a2b8',
	warning: '#ffc107',
	danger: '#dc3545',
	light: '#f8f9fa',
	dark: '#343a40'
}
