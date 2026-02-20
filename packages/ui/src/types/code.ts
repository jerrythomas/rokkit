/**
 * Code component types
 */

import { defaultStateIcons } from '@rokkit/core'

/** Supported themes for code highlighting */
export type CodeTheme = 'light' | 'dark'

/**
 * Icons configuration for code action states.
 * Keys match the naming convention in @rokkit/core defaultStateIcons.
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
	copy: defaultStateIcons.action.copy,
	copysuccess: defaultStateIcons.action.copysuccess
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
