export { defaultColors, syntaxColors, shades, defaultPalette } from './colors/index.js'
export const DATA_IMAGE_REGEX = /^data:image\/(jpeg|png|gif|bmp|webp|svg\+xml)/i

// ─── Snippet names ────────────────────────────────────────────────────────────

export const ITEM_SNIPPET = 'itemContent'
export const GROUP_SNIPPET = 'groupContent'
/**
 * @deprecated Use BASE_FIELDS from @rokkit/core instead.
 * Retained for legacy ListController/FieldMapper/Proxy consumers (Toolbar, Table).
 * Will be removed when those components migrate to Wrapper+Navigator.
 * @type {import('./types).FieldMapping} Fields
 */
export const DEFAULT_FIELDS = {
	id: 'id',
	href: 'href',
	icon: 'icon',
	text: 'text',
	value: 'value',
	keywords: 'keywords',
	children: 'children',
	iconPrefix: null,
	image: 'image',
	summary: 'summary',
	notes: 'notes',
	props: 'props',
	target: 'target',
	state: 'state',
	level: 'level',
	parent: 'parent',
	currency: 'currency',
	label: 'label',
	component: 'component', // to be deprecated in favour of snippet
	snippet: 'snippet',
	disabled: 'disabled',
	/* flag fields  */
	deleted: '_deleted',
	expanded: '_expanded',
	selected: '_selected'
}

// ─── BASE_FIELDS ─────────────────────────────────────────────────────────────
// Canonical field mapping for ProxyItem and all Wrapper+Navigator components.
// Semantic keys map to common raw data keys for backward compatibility.

export const BASE_FIELDS = {
	// Identity
	id: 'id',
	value: 'value',
	// Display
	label: 'text',
	icon: 'icon',
	avatar: 'image',
	subtext: 'description',
	tooltip: 'title',
	badge: 'badge',
	shortcut: 'shortcut',
	// Structure
	children: 'children',
	type: 'type',
	snippet: 'snippet',
	href: 'href',
	hrefTarget: 'target',
	// State
	disabled: 'disabled',
	expanded: 'expanded',
	selected: 'selected',
}

const LEGACY_KEY_MAP = { text: 'label', description: 'subtext', title: 'tooltip', image: 'avatar', target: 'hrefTarget' }

/**
 * Remap legacy field-override keys to their BASE_FIELDS semantic equivalents.
 * e.g. { text: 'name' } → { label: 'name' }
 *
 * @param {Record<string, string> | null | undefined} fields
 * @returns {Record<string, string>}
 */
export function normalizeFields(fields) {
	if (!fields || typeof fields !== 'object') return {}
	const result = {}
	for (const [key, value] of Object.entries(fields)) {
		result[LEGACY_KEY_MAP[key] ?? key] = value
	}
	return result
}

export const DEFAULT_ICONS = [
	'accordion-opened',
	'accordion-closed',
	'action-remove',
	'action-cancel',
	'action-retry',
	'action-add',
	'action-clear',
	'action-search',
	'action-close',
	'action-copy',
	'action-copysuccess',
	'action-check',
	'action-pin',
	'action-save',
	'action-unpin',
	'node-opened',
	'node-closed',
	'folder-opened',
	'folder-closed',
	'selector-opened',
	'selector-closed',
	'menu-opened',
	'menu-closed',
	'checkbox-checked',
	'checkbox-unchecked',
	'checkbox-unknown',
	'rating-filled',
	'rating-empty',
	'rating-half',
	'radio-off',
	'radio-on',
	'mode-dark',
	'mode-light',
	'mode-system',
	'navigate-left',
	'navigate-right',
	'navigate-up',
	'navigate-down',
	'palette-hex',
	'palette-presets',
	'state-error',
	'state-warning',
	'state-success',
	'state-info',
	'state-unknown',
	'badge-fail',
	'badge-warn',
	'badge-pass',
	'badge-unknown',
	'sort-none',
	'sort-ascending',
	'sort-descending',
	'validity-failed',
	'validity-passed',
	'validity-unknown',
	'validity-warning',
	'alert-clear',
	'alert-unread',
	'align-horizontal-left',
	'align-horizontal-right',
	'align-horizontal-center',
	'align-vertical-top',
	'align-vertical-bottom',
	'align-vertical-middle'
]

export const DEFAULT_OPTIONS = {
	id: 'id',
	label: 'label',
	value: 'value',
	checked: 'checked'
}

export const DEFAULT_KEYMAP = {
	ArrowRight: 'open',
	ArrowLeft: 'close',
	ArrowDown: 'down',
	ArrowUp: 'up',
	Enter: 'select',
	Escape: 'deselect'
}

export const DEFAULT_THEME_MAPPING = {
	surface: 'slate',
	primary: 'orange',
	secondary: 'pink',
	accent: 'sky',
	success: 'green',
	warning: 'yellow',
	danger: 'red',
	error: 'red',
	info: 'cyan'
}

export const TONE_MAP = {
	z0: 50,
	z1: 100,
	z2: 200,
	z3: 300,
	z4: 400,
	z5: 500,
	z6: 600,
	z7: 700,
	z8: 800,
	z9: 900,
	z10: 950
}
/**
 * Splits an icon name into its group and key components.
 * @param {string} name - The icon name to split.
 * @returns {{ group: string, key: string, value: string }} An object containing the group, key, and value of the icon name.
 */
function splitIconName(name) {
	const parts = name.split('-')
	const group = parts.slice(0, parts.length - 1).join('-')
	return { group, key: parts[parts.length - 1], value: name }
}

/**
 * Generate a state icon mapping from a list of icon names
 *
 * @param {string[]} icons
 * @returns {import('./types').StateIcons}
 */
export function stateIconsFromNames(icons) {
	return icons.map(splitIconName).reduce(
		(acc, { group, key, value }) => ({
			...acc,
			[group]: { ...acc[group], [key]: value }
		}),
		{}
	)
}

export const DEFAULT_STATE_ICONS = stateIconsFromNames(DEFAULT_ICONS)
