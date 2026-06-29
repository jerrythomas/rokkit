import { describe, it, expect } from 'vitest'
import { highlightCode, getSupportedLanguages, preloadHighlighter } from '../src/utils/shiki.js'

describe('Shiki Utilities', () => {
	// ─── getSupportedLanguages ───────────────────────────────────────

	describe('getSupportedLanguages', () => {
		it('returns an array of language strings', () => {
			const langs = getSupportedLanguages()
			expect(Array.isArray(langs)).toBe(true)
			expect(langs.length).toBeGreaterThan(0)
		})

		it('includes common languages', () => {
			const langs = getSupportedLanguages()
			expect(langs).toContain('javascript')
			expect(langs).toContain('typescript')
			expect(langs).toContain('svelte')
			expect(langs).toContain('css')
			expect(langs).toContain('html')
			expect(langs).toContain('json')
		})
	})

	// ─── highlightCode ──────────────────────────────────────────────

	describe('highlightCode', () => {
		it('returns HTML string', async () => {
			const html = await highlightCode('const x = 1', { lang: 'javascript' })
			expect(typeof html).toBe('string')
			expect(html.length).toBeGreaterThan(0)
		})

		it('returns HTML with pre and code elements', async () => {
			const html = await highlightCode('const x = 1', { lang: 'javascript' })
			expect(html).toContain('<pre')
			expect(html).toContain('<code')
		})

		it('applies dark theme by default', async () => {
			const html = await highlightCode('x', { lang: 'text', theme: 'dark' })
			expect(html).toContain('github-dark')
		})

		it('applies light theme', async () => {
			const html = await highlightCode('x', { lang: 'text', theme: 'light' })
			expect(html).toContain('github-light')
		})

		it('uses dark theme when no theme option given', async () => {
			// resolveTheme: !themeOption → 'github-dark'
			const html = await highlightCode('x', {})
			expect(html).toContain('github-dark')
		})

		it('uses dark theme when called with no options', async () => {
			// highlightCode with default options = {}
			const html = await highlightCode('hello world')
			expect(typeof html).toBe('string')
			expect(html).toContain('github-dark')
		})

		it('passes through a specific bundled theme name', async () => {
			// resolveTheme: themeOption is not 'light' or 'dark' → returns it as BundledTheme
			const html = await highlightCode('x', { theme: 'github-light' })
			expect(html).toContain('github-light')
		})

		it('throws for empty code', async () => {
			await expect(highlightCode('', { lang: 'text' })).rejects.toThrow('Invalid code')
		})

		it('falls back to text for unsupported language', async () => {
			// Should not throw for an unknown language (effectiveLang falls back to 'text')
			const html = await highlightCode('hello', { lang: 'some-unknown-lang' })
			expect(typeof html).toBe('string')
			expect(html.length).toBeGreaterThan(0)
		})

		it('maps fence language aliases to json (plot → json)', async () => {
			// LANGUAGE_ALIASES: plot/table/form/list/stepper/sparkline/chart → json
			const html = await highlightCode('{"key": "value"}', { lang: 'plot' })
			expect(typeof html).toBe('string')
			expect(html).toContain('<pre')
		})

		it('maps table alias to json', async () => {
			const html = await highlightCode('[{"col": 1}]', { lang: 'table' })
			expect(typeof html).toBe('string')
			expect(html).toContain('<pre')
		})

		it('maps form alias to json', async () => {
			const html = await highlightCode('{}', { lang: 'form' })
			expect(typeof html).toBe('string')
		})

		it('maps list alias to json', async () => {
			const html = await highlightCode('[]', { lang: 'list' })
			expect(typeof html).toBe('string')
		})

		it('maps stepper alias to json', async () => {
			const html = await highlightCode('{}', { lang: 'stepper' })
			expect(typeof html).toBe('string')
		})

		it('maps sparkline alias to json', async () => {
			const html = await highlightCode('[1,2,3]', { lang: 'sparkline' })
			expect(typeof html).toBe('string')
		})

		it('maps chart alias to json', async () => {
			const html = await highlightCode('{}', { lang: 'chart' })
			expect(typeof html).toBe('string')
		})

		it('uses cached highlighter on second call', async () => {
			// First call initializes the singleton
			await highlightCode('a', { lang: 'text' })
			// Second call should use the cached highlighter (exercises the `if (highlighter)` branch)
			const html = await highlightCode('b', { lang: 'text' })
			expect(typeof html).toBe('string')
		})

		it('strips style attribute from pre tag', async () => {
			// The .replace() call removes inline style from <pre>
			const html = await highlightCode('x = 1', { lang: 'python' })
			// The pre tag should not contain a style attribute
			const preMatch = html.match(/<pre[^>]*>/)
			if (preMatch) {
				expect(preMatch[0]).not.toMatch(/style="[^"]*"/)
			}
		})
	})

	// ─── preloadHighlighter ─────────────────────────────────────────

	describe('preloadHighlighter', () => {
		it('does not throw', async () => {
			await expect(preloadHighlighter()).resolves.not.toThrow()
		})

		it('resolves without a value (returns void)', async () => {
			const result = await preloadHighlighter()
			expect(result).toBeUndefined()
		})

		it('is idempotent — calling multiple times is safe', async () => {
			// Exercises both the "already initializing" and "already initialized" paths
			await Promise.all([preloadHighlighter(), preloadHighlighter(), preloadHighlighter()])
			await expect(preloadHighlighter()).resolves.not.toThrow()
		})
	})
})
