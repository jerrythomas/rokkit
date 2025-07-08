/**
 * @fileoverview Utility functions for loading demo components and their source code
 * This module provides helpers to dynamically import demo components and read their source code
 * for use with the CodeViewer component in tutorial sections.
 */

import { preloadHighlighter } from '$lib/shiki.js'

/**
 * @typedef {Object} DemoData
 * @property {any} component - The imported Svelte component
 * @property {string} code - The source code as a string
 * @property {string} [title] - Optional demo title
 * @property {string} [description] - Optional demo description
 */

/**
 * Cache for loaded demos to avoid re-importing
 * @type {Map<string, Promise<DemoData>>}
 */
const demoCache = new Map()

/**
 * Extract a human-readable title from a demo path
 * @param {string} demoPath - The demo path
 * @returns {string} Formatted title
 */
function extractTitleFromPath(demoPath) {
	return demoPath
		.split('/')
		.pop()
		.replace(/-/g, ' ')
		.replace(/\b\w/g, (l) => l.toUpperCase())
}

/**
 * Get fallback source code
 * @returns {string} Empty string - we no longer provide fallback code
 */
function getFallbackCode() {
	return ''
}

/**
 * Load source code from a file path
 * @param {string} filePath - Path to the source file
 * @returns {Promise<string>} Promise resolving to source code
 */
async function loadSourceCode(filePath) {
	let lastError = null

	// Strategy 1: Try to fetch from our custom API endpoint
	try {
		const response = await fetch(`/api/source-code?path=${encodeURIComponent(filePath)}`)
		if (response.ok) {
			return await response.text()
		}
		lastError = `API failed with status ${response.status}: ${response.statusText}`
	} catch (error) {
		lastError = `API request failed: ${error.message}`
	}

	// Strategy 2: Try to load as a text import
	try {
		const sourceModule = await import(/* @vite-ignore */ `${filePath}?raw`)
		return sourceModule.default
	} catch (error) {
		lastError = `Raw import failed: ${error.message}`
	}

	// Strategy 3: Throw an error instead of returning fallback
	throw new Error(`Failed to load source code for ${filePath}. Last error: ${lastError}`)
}

/**
 * Internal function to load demo data
 * @param {string} demoPath - Path to the demo folder
 * @returns {Promise<DemoData>} Promise resolving to demo data
 */
async function loadDemoInternal(demoPath) {
	let componentError = null
	let codeError = null

	// Preload Shiki highlighter for better performance
	preloadHighlighter().catch((err) => {
		console.warn('Failed to preload syntax highlighter:', err)
	})

	// Try to import the component
	let component = null
	try {
		const componentModule = await import(`./${demoPath}/src/App.svelte`)
		component = componentModule.default
	} catch (error) {
		componentError = error
	}

	// Try to load the source code
	let code = ''
	try {
		const filePath = `src/routes/(learn)/tutorial/${demoPath}/src/App.svelte`
		code = await loadSourceCode(filePath)
	} catch (error) {
		codeError = error
	}

	// If both component and code failed, throw an error
	if (componentError && codeError) {
		throw new Error(
			`Demo not found: ${demoPath}. Component error: ${componentError.message}, Code error: ${codeError.message}`
		)
	}

	// If only component failed, throw an error
	if (componentError) {
		throw new Error(`Demo component not found: ${demoPath}. Error: ${componentError.message}`)
	}

	// If only code failed, log warning but continue with empty code
	if (codeError) {
		console.warn(`Failed to load source code for ${demoPath}:`, codeError.message)
	}

	return {
		component,
		code,
		title: extractTitleFromPath(demoPath),
		description: ''
	}
}

/**
 * Load a demo component and its source code
 * @param {string} demoPath - Path to the demo folder (e.g., 'introduction/basic-list')
 * @returns {Promise<DemoData>} Promise resolving to demo data
 *
 * @example
 * ```js
 * // Load a demo from tutorial/introduction/src/App.svelte
 * const demo = await loadDemo('introduction')
 * ```
 */
export async function loadDemo(demoPath) {
	// Check cache first
	if (demoCache.has(demoPath)) {
		const cached = demoCache.get(demoPath)
		if (cached) {
			return await cached
		}
	}

	const loadPromise = loadDemoInternal(demoPath)
	demoCache.set(demoPath, loadPromise)

	try {
		return await loadPromise
	} catch (err) {
		// Remove failed attempts from cache
		demoCache.delete(demoPath)
		throw err
	}
}

/**
 * Create a demo loader that's pre-configured for a specific tutorial section
 * @param {string} sectionPath - Base path for the tutorial section
 * @returns {Function} Configured demo loader function
 *
 * @example
 * ```js
 * // Create a loader for the forms section
 * const loadFormsDemo = createSectionLoader('forms')
 * const demo = await loadFormsDemo('basic-input')
 * ```
 */
export function createSectionLoader(sectionPath) {
	/**
	 * @param {string} demoName - Name of the demo to load
	 * @returns {Promise<DemoData>} Promise resolving to demo data
	 */
	return async function loadSectionDemo(demoName) {
		const fullPath = `${sectionPath}/${demoName}`
		return await loadDemo(fullPath)
	}
}

/**
 * Load multiple demos in parallel
 * @param {string[]} demoPaths - Array of demo paths to load
 * @returns {Promise<DemoData[]>} Promise resolving to array of demo data
 */
export async function loadMultipleDemos(demoPaths) {
	const promises = demoPaths.map((path) => loadDemo(path))
	return await Promise.all(promises)
}

/**
 * Check if a demo exists before attempting to load it
 * @param {string} demoPath - Path to check
 * @returns {Promise<boolean>} Promise resolving to existence check
 */
export async function demoExists(demoPath) {
	try {
		await loadDemo(demoPath)
		return true
	} catch {
		return false
	}
}

/**
 * Clear the demo cache (useful for development)
 */
export function clearDemoCache() {
	demoCache.clear()
}

/**
 * Preload demos and syntax highlighter for better performance
 * @param {string[]} demoPaths - Array of demo paths to pre-load
 * @returns {Promise<void>} Promise that resolves when all demos are cached
 */
export async function preloadDemos(demoPaths) {
	// Preload syntax highlighter alongside demos
	const highlighterPromise = preloadHighlighter()
	const demoPromises = demoPaths.map((path) => loadDemo(path))

	const [, ...demoResults] = await Promise.allSettled([highlighterPromise, ...demoPromises])

	return demoResults
}
