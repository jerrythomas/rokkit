/**
 * Code component types
 */

/** Supported themes for code highlighting */
export type CodeTheme = 'light' | 'dark'

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
	/** Additional CSS class */
	class?: string
}
