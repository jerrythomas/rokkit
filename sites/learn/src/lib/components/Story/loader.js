/**
 * @fileoverview Utility functions for loading story components and their source code
 * This module provides helpers to dynamically import story components and read their source code
 * for use with the CodeViewer component in tutorial sections.
 */

import { preloadHighlighter } from '../../shiki.js'
// import { guide } from '../../stories/index.js' // Temporarily disabled for stability

/**
 * Language mapping dictionary for file extensions
 */
const LANGUAGE_MAP = {
	js: 'javascript',
	svelte: 'svelte',
	json: 'json',
	css: 'css',
	md: 'markdown'
}

/**
 * File patterns to look for in story directories
 */
const FILE_PATTERNS = ['*.svelte', '*.js', '*.json', '*.css']

/**
 * @typedef {Object} StoryFile
 * @property {string} id - Unique identifier for the file
 * @property {string} name - Display name of the file
 * @property {string} language - Programming language for syntax highlighting
 * @property {string} content - File content
 * @property {string} [icon] - Optional icon for the file
 */

/**
 * @typedef {Object} StoryData
 * @property {any} component - The imported Svelte component
 * @property {string} code - The source code as a string
 * @property {StoryFile[]} files - Array of files for multi-file stories
 * @property {string} [title] - Optional story title
 * @property {string} [description] - Optional story description
 */

/**
 * Cache for loaded stories to avoid re-importing
 * @type {Map<string, Promise<StoryData>>}
 */
const storyCache = new Map()

/**
 * Extract a human-readable title from a story path
 * @param {string} storyPath - The story path
 * @returns {string} Formatted title
 */
function extractTitleFromPath(storyPath) {
	return storyPath
		.split('/')
		.pop()
		.replace(/-/g, ' ')
		.replace(/\b\w/g, (l) => l.toUpperCase())
}

/**
 * Get file language from extension (kept for backward compatibility)
 * @param {string} filename - The filename
 * @returns {string} Programming language
 */
function getLanguageFromFilename(filename) {
	const ext = filename.split('.').pop()?.toLowerCase()
	return LANGUAGE_MAP[ext] || 'text'
}

/**
 * Load a story component and its source code using the global guide
 * @param {string} storyPath - Path to the story folder (e.g., 'introduction/basic-list')
 * @returns {Promise<StoryData>} Promise resolving to story data
 *
 * @example
 * ```js
 * // Load a story from tutorial/introduction/src/App.svelte
 * const story = await loadStory('introduction')
 * ```
 */
export async function loadStory(storyPath) {
	// Check cache first
	if (storyCache.has(storyPath)) {
		const cached = storyCache.get(storyPath)
		if (cached) {
			return await cached
		}
	}

	// Use the global guide object for story loading
	const loadPromise = loadStoryFromGuide(storyPath)
	storyCache.set(storyPath, loadPromise)

	try {
		const result = await loadPromise

		// Preload Shiki highlighter for better performance
		preloadHighlighter().catch((err) => {
			console.warn('Failed to preload syntax highlighter:', err)
		})

		return result
	} catch (err) {
		// Remove failed attempts from cache
		storyCache.delete(storyPath)
		throw err
	}
}

/**
 * Map clean slug to story path with numeric prefixes using guide system
 * @param {string} slug - Clean slug like "welcome/introduction"
 * @returns {Promise<string>} Mapped path like "01-welcome/01-introduction"
 */
function mapSlugToStoryPath(slug) {
	// For now, just use the hardcoded mapping to get things working
	// We'll enhance this with the guide system once it's stable
	const fallbackMapping = {
		'welcome/introduction': '01-welcome/01-introduction',
		'welcome/getting-started': '01-welcome/02-getting-started',
		'elements/list': '02-elements/01-list',
		'elements/list/intro': '02-elements/01-list/01-intro',
		'elements/list/snippets': '02-elements/01-list/02-snippets',
		'elements/list/mapping': '02-elements/01-list/03-mapping',
		'elements/list/mixed': '02-elements/01-list/04-mixed',
		'primitives/icon': '03-primitives/01-icon',
		'forms/inputs': '04-forms/01-inputs'
	}

	return fallbackMapping[slug] || slug
}

/**
 * Load a story from the global guide object
 * @param {string} storyPath - Path to the story folder
 * @returns {Promise<StoryData>} Promise resolving to story data
 */
async function loadStoryFromGuide(storyPath) {
	let component = null
	let files = []
	let code = ''

	// Use the direct mapping approach 
	const mappedPath = mapSlugToStoryPath(storyPath)

	try {
		// Direct component imports with specific paths
		if (mappedPath === '01-welcome/01-introduction') {
			const directModule = await import('../../stories/01-welcome/01-introduction/src/App.svelte')
			component = directModule.default
			const sourceModule = await import('../../stories/01-welcome/01-introduction/src/App.svelte?raw')
			code = sourceModule.default
		} else if (mappedPath === '01-welcome/02-getting-started') {
			const directModule = await import('../../stories/01-welcome/02-getting-started/src/App.svelte')
			component = directModule.default
			const sourceModule = await import('../../stories/01-welcome/02-getting-started/src/App.svelte?raw')
			code = sourceModule.default
		} else if (mappedPath === '02-elements/01-list') {
			const directModule = await import('../../stories/02-elements/01-list/src/App.svelte')
			component = directModule.default
			const sourceModule = await import('../../stories/02-elements/01-list/src/App.svelte?raw')
			code = sourceModule.default
		} else if (mappedPath === '02-elements/01-list/01-intro') {
			const directModule = await import('../../stories/02-elements/01-list/01-intro/src/App.svelte')
			component = directModule.default
			const sourceModule = await import('../../stories/02-elements/01-list/01-intro/src/App.svelte?raw')
			code = sourceModule.default
		} else if (mappedPath === '02-elements/01-list/02-snippets') {
			const directModule = await import('../../stories/02-elements/01-list/02-snippets/src/App.svelte')
			component = directModule.default
			const sourceModule = await import('../../stories/02-elements/01-list/02-snippets/src/App.svelte?raw')
			code = sourceModule.default
		} else if (mappedPath === '02-elements/01-list/03-mapping') {
			const directModule = await import('../../stories/02-elements/01-list/03-mapping/src/App.svelte')
			component = directModule.default
			const sourceModule = await import('../../stories/02-elements/01-list/03-mapping/src/App.svelte?raw')
			code = sourceModule.default
		} else if (mappedPath === '02-elements/01-list/04-mixed') {
			const directModule = await import('../../stories/02-elements/01-list/04-mixed/src/App.svelte')
			component = directModule.default
			const sourceModule = await import('../../stories/02-elements/01-list/04-mixed/src/App.svelte?raw')
			code = sourceModule.default
		} else if (mappedPath === '03-primitives/01-icon') {
			const directModule = await import('../../stories/03-primitives/01-icon/src/App.svelte')
			component = directModule.default
			const sourceModule = await import('../../stories/03-primitives/01-icon/src/App.svelte?raw')
			code = sourceModule.default
		} else if (mappedPath === '04-forms/01-inputs') {
			const directModule = await import('../../stories/04-forms/01-inputs/src/App.svelte')
			component = directModule.default
			const sourceModule = await import('../../stories/04-forms/01-inputs/src/App.svelte?raw')
			code = sourceModule.default
		}
		
		if (!component) {
			throw new Error(`No direct import available for ${mappedPath}`)
		}
		
	} catch (error) {
		console.error(`Failed to load component: ${error.message}`)
		throw error
	}

	// Create proper file structure for code display
	const storyFiles = code
		? [
				{
					id: 'src/App.svelte',
					name: 'App.svelte',
					language: 'svelte',
					content: code,
					icon: 'svelte'
				}
			]
		: []

	return {
		component,
		code,
		files: storyFiles,
		title: extractTitleFromPath(storyPath),
		description: `Interactive demo for ${extractTitleFromPath(storyPath)}`
	}
}

/**
 * Get an appropriate icon for a file based on its extension
 * @param {string} filename - The filename
 * @returns {string} Icon identifier
 */
function getFileIcon(filename) {
	const ext = filename.split('.').pop()?.toLowerCase()
	const iconMap = {
		svelte: 'svelte',
		js: 'javascript',
		json: 'json',
		css: 'css',
		md: 'markdown'
	}
	return iconMap[ext] || 'file'
}

/**
 * Create a story loader that's pre-configured for a specific tutorial section
 * @param {string} sectionPath - Base path for the tutorial section
 * @returns {Function} Configured story loader function
 *
 * @example
 * ```js
 * // Create a loader for the forms section
 * const loadFormsStory = createSectionLoader('forms')
 * const story = await loadFormsStory('basic-input')
 * ```
 */
export function createSectionLoader(sectionPath) {
	/**
	 * @param {string} storyName - Name of the story to load
	 * @returns {Promise<StoryData>} Promise resolving to story data
	 */
	return async function loadSectionStory(storyName) {
		const fullPath = `${sectionPath}/${storyName}`
		return await loadStory(fullPath)
	}
}

/**
 * Load multiple stories in parallel
 * @param {string[]} storyPaths - Array of story paths to load
 * @returns {Promise<StoryData[]>} Promise resolving to array of story data
 */
export async function loadMultipleStories(storyPaths) {
	const promises = storyPaths.map((path) => loadStory(path))
	return await Promise.all(promises)
}

/**
 * Check if a story exists before attempting to load it
 * @param {string} storyPath - Path to check
 * @returns {Promise<boolean>} Promise resolving to existence check
 */
export async function storyExists(storyPath) {
	try {
		await loadStory(storyPath)
		return true
	} catch {
		return false
	}
}

/**
 * Clear the story cache (useful for development)
 */
export function clearStoryCache() {
	storyCache.clear()
}

/**
 * Preload stories and syntax highlighter for better performance
 * @param {string[]} storyPaths - Array of story paths to pre-load
 * @returns {Promise<void>} Promise that resolves when all stories are cached
 */
export async function preloadStories(storyPaths) {
	// Preload syntax highlighter alongside stories
	const highlighterPromise = preloadHighlighter()
	const storyPromises = storyPaths.map((path) => loadStory(path))

	const [, ...storyResults] = await Promise.allSettled([highlighterPromise, ...storyPromises])

	return storyResults
}

// Backward compatibility exports (deprecated - use Story versions)
export const loadDemo = loadStory
export const loadMultipleDemos = loadMultipleStories
export const demoExists = storyExists
export const clearDemoCache = clearStoryCache
export const preloadDemos = preloadStories
