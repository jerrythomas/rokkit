/**
 * Code component types — Code, CodeBlock, CodeGroup
 */

import type { Snippet } from 'svelte'
import { DEFAULT_STATE_ICONS } from '@rokkit/core'

/** Supported themes for code highlighting */
export type CodeTheme = 'light' | 'dark'

/**
 * Icons configuration for code action states.
 * Keys match the naming convention in @rokkit/core DEFAULT_STATE_ICONS.
 */
export interface CodeStateIcons {
	/** Icon class for copy button */
	copy?: string
	/** Icon class for copy success state */
	copysuccess?: string
}

/**
 * Default state icons — uses semantic names from @rokkit/core
 * that get resolved to actual icon classes via UnoCSS shortcuts.
 */
export const defaultCodeStateIcons: CodeStateIcons = {
	copy: DEFAULT_STATE_ICONS.action.copy,
	copysuccess: DEFAULT_STATE_ICONS.action.copysuccess
}

/** Props for the Code component */
export interface CodeProps {
	/** The code string to display and highlight */
	code: string
	/** Programming language for syntax highlighting */
	language?: string
	/** Color theme for the code block */
	theme?: CodeTheme
	/** Whether to show line numbers */
	showLineNumbers?: boolean
	/** Whether to show the copy button */
	showCopyButton?: boolean
	/** Icons for copy action states */
	icons?: CodeStateIcons
	/** Additional CSS class */
	class?: string
}

/**
 * Shiki theme mode for CodeBlock.
 *
 * `'auto'` follows `body[data-mode]` (light / dark). Pass `'light'` or
 * `'dark'` to force a theme.
 */
export type CodeBlockTheme = 'auto' | 'light' | 'dark'

/**
 * Props for the CodeBlock component.
 *
 * Wraps a Shiki-highlighted code body in a Frame whose header carries the
 * filename + language chip and optional action buttons.
 */
export interface CodeBlockProps {
	/** The code body. */
	code: string

	/** Language label shown as a chip in the header and used for highlighting. */
	language?: string

	/** Filename label shown in the header. */
	filename?: string

	/** Max height (CSS length) of the scrollable code area. No cap when unset. */
	height?: string

	/** Shiki theme mode. Default `'auto'`. */
	theme?: CodeBlockTheme

	/** Show the copy-to-clipboard button. Default `false`. */
	allowCopy?: boolean

	/** Show the download-as-file button. Default `false`. */
	allowDownload?: boolean

	/** Optional extra-actions slot rendered after copy / download. */
	actions?: Snippet
}

/**
 * One file in a CodeGroup.
 *
 * The `path` doubles as id and tree placement (e.g. `src/lib/Button.svelte`).
 * Intermediate segments become folder nodes; the final segment becomes a
 * file leaf.
 */
export interface CodeGroupFile {
	/** Full path used as id and for tree placement. */
	path: string

	/** Shiki language id. */
	language: string

	/** Source code. */
	code: string

	/** Display name override — defaults to the path's last segment. */
	name?: string

	/** File icon override (full icon class) — defaults to extension lookup. */
	icon?: string
}

/**
 * Icon overrides for the CodeGroup component, grouped by semantic category.
 */
export interface CodeGroupIconOverrides {
	doc?: Partial<typeof DEFAULT_STATE_ICONS.doc>
	folder?: Partial<typeof DEFAULT_STATE_ICONS.folder>
	view?: Partial<typeof DEFAULT_STATE_ICONS.view>
	action?: Partial<typeof DEFAULT_STATE_ICONS.action>
}

/**
 * Props for the CodeGroup component.
 *
 * Renders a hierarchical tree picker over multiple files with an optional
 * collapsible preview panel.
 */
export interface CodeGroupProps {
	/** Files rendered in the group. */
	files: CodeGroupFile[]

	/** Path of the file selected on first render. Defaults to the first file. */
	initialFile?: string

	/** Additional CSS class. */
	class?: string

	/** Icon overrides per semantic category. */
	icons?: CodeGroupIconOverrides

	/** Optional preview content — toggled by a "Show preview" action. */
	preview?: Snippet

	/** Show the copy button on the inner CodeBlock. Default `true`. */
	showCopyButton?: boolean
}
