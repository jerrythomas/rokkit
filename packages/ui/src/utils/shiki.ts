/**
 * Shiki syntax highlighting utility
 */

import { createHighlighter, type Highlighter, type BundledLanguage, type BundledTheme } from 'shiki'

let highlighter: Highlighter | null = null
let isInitializing = false
let initPromise: Promise<Highlighter> | null = null

// Supported languages for the application
const SUPPORTED_LANGUAGES: BundledLanguage[] = [
	'svelte',
	'javascript',
	'typescript',
	'css',
	'html',
	'json',
	'bash',
	'shell',
	'markdown',
	'yaml',
	'sql'
]

// Available themes
const THEMES: BundledTheme[] = ['github-light', 'github-dark']

/**
 * Initialize Shiki highlighter (singleton)
 */
function initializeHighlighter(): Promise<Highlighter> {
	if (highlighter) return Promise.resolve(highlighter)

	if (isInitializing && initPromise) {
		return initPromise
	}

	isInitializing = true

	initPromise = createHighlighter({
		themes: THEMES,
		langs: SUPPORTED_LANGUAGES
	})
		.then((hl: Highlighter) => {
			highlighter = hl
			isInitializing = false
			return hl
		})
		.catch((error: Error) => {
			isInitializing = false
			initPromise = null
			throw error
		})

	return initPromise
}

export interface HighlightOptions {
	/** Language for syntax highlighting */
	lang?: BundledLanguage | string
	/** Theme to use (defaults based on user preference) */
	theme?: BundledTheme | 'light' | 'dark'
}

/**
 * Highlight code using Shiki
 *
 * @param code - The code to highlight
 * @param options - Highlighting options
 * @returns The highlighted code as HTML
 */
function resolveTheme(themeOption: string | undefined): BundledTheme {
	if (themeOption === 'light') return 'github-light'
	if (themeOption === 'dark' || !themeOption) return 'github-dark'
	return themeOption as BundledTheme
}

function isValidCode(code: unknown): code is string {
	return Boolean(code) && typeof code === 'string'
}

export async function highlightCode(code: string, options: HighlightOptions = {}): Promise<string> {
	if (!isValidCode(code)) throw new Error('Invalid code provided for highlighting')

	const hl = await initializeHighlighter()
	const lang = (options.lang ?? 'text') as BundledLanguage
	const theme = resolveTheme(options.theme)
	const loadedLangs = hl.getLoadedLanguages()
	const effectiveLang = loadedLangs.includes(lang) ? lang : 'text'

	return hl
		.codeToHtml(code, { lang: effectiveLang, theme })
		.replace(/(<pre[^>]+) style="[^"]*"/, '$1')
}

/**
 * Preload the syntax highlighter for faster initial rendering
 * Errors are silently ignored since preloading is optional
 */
export async function preloadHighlighter(): Promise<void> {
	try {
		await initializeHighlighter()
	} catch {
		// Preload failures are non-critical - highlighting will still work on demand
	}
}

/**
 * Get list of supported languages
 */
export function getSupportedLanguages(): readonly string[] {
	return SUPPORTED_LANGUAGES
}
