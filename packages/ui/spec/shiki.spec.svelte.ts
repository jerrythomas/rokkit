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

		it('throws for empty code', async () => {
			await expect(highlightCode('', { lang: 'text' })).rejects.toThrow('Invalid code')
		})

		it('falls back to text for unsupported language', async () => {
			// Should not throw for an unknown language
			const html = await highlightCode('hello', { lang: 'some-unknown-lang' })
			expect(typeof html).toBe('string')
			expect(html.length).toBeGreaterThan(0)
		})
	})

	// ─── preloadHighlighter ─────────────────────────────────────────

	describe('preloadHighlighter', () => {
		it('does not throw', async () => {
			await expect(preloadHighlighter()).resolves.not.toThrow()
		})
	})
})
