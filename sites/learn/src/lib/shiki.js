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
	if (highlighter) {
		return highlighter
	}

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
			langs: ['svelte', 'javascript', 'typescript', 'css', 'html', 'json']
		})

		isInitializing = false
		return highlighter
	} catch (error) {
		isInitializing = false
		throw error
	}
}

/**
 * Detect language from filename
 */
function detectLanguage(filename = '') {
	const ext = filename.split('.').pop()
	const langMap = {
		svelte: 'svelte',
		ts: 'typescript',
		css: 'css',
		html: 'html',
		json: 'json'
	}
	return langMap[ext] || 'javascript'
}

/**
 * Escape HTML characters
 */
function escapeHtml(text) {
	return text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
}

export async function highlightCode(code, options = {}) {
	if (!code || typeof code !== 'string') {
		throw new Error('Invalid code provided for highlighting')
	}

	try {
		const hl = await initializeHighlighter()
		const lang = options.lang || detectLanguage('App.svelte')
		const theme = options.theme || 'github-light'

		return hl.codeToHtml(code, {
			lang,
			theme,
			transformers: [
				{
					pre(node) {
						node.properties.class = [
							...(node.properties.class || []),
							'overflow-x-auto',
							'!bg-transparent',
							'!p-0',
							'm-0'
						]
					},
					code(node) {
						node.properties.class = [
							...(node.properties.class || []),
							'block',
							'text-sm',
							'leading-relaxed'
						]
					}
				}
			]
		})
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
