/**
 * @fileoverview Shiki syntax highlighting utility for CodeViewer
 */

import { createHighlighter } from 'shiki'

let highlighter = null
let isInitializing = false

/**
 * Initialize Shiki highlighter
 */
async function initializeHighlighter() {
	if (highlighter) return highlighter

	if (isInitializing) {
		while (isInitializing) {
			await new Promise((resolve) => setTimeout(resolve, 50))
		}
		return highlighter
	}

	isInitializing = true

	try {
		highlighter = await createHighlighter({
			themes: ['github-light', 'github-dark'],
			langs: ['svelte', 'javascript', 'typescript', 'css', 'html', 'json', 'bash', 'shell']
		})

		isInitializing = false
		return highlighter
	} catch (error) {
		isInitializing = false
		throw error
	}
}

/**
 * Highlight code using Shiki
 *
 * @param {string} code - The code to highlight
 * @param {object} options - Options for highlighting
 * @param {string} options.lang - The language to highlight
 * @param {string} options.theme - The theme to use for highlighting
 * @returns {Promise<string>} - The highlighted code as HTML
 */
export async function highlightCode(code, options = {}) {
	if (!code || typeof code !== 'string') {
		throw new Error('Invalid code provided for highlighting')
	}

	try {
		const hl = await initializeHighlighter()
		const lang = options.lang
		const theme = options.theme

		return hl
			.codeToHtml(code, {
				lang,
				theme
			})
			.replace(/(<pre[^>]+) style=".*?"/, '$1') /* remove conflicting background color */
	} catch (error) {
		throw new Error(`Failed to highlight code: ${error.message}`)
	}
}

export async function preloadHighlighter() {
	try {
		await initializeHighlighter()
	} catch (error) {
		console.warn('Failed to preload syntax highlighter:', error.message)
	}
}

/**
 * Reset highlighter state - for testing only
 * @internal
 * @throws {Error} If called outside of test environment
 */
export function resetForTesting() {
	if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'test') {
		throw new Error('resetForTesting should only be called in test environment')
	}
	highlighter = null
	isInitializing = false
}
