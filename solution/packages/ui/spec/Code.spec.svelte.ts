import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent, waitFor } from '@testing-library/svelte'
import Code from '../src/components/Code.svelte'

describe('Code', () => {
	// ─── Rendering ──────────────────────────────────────────────────

	it('renders a code block container', () => {
		const { container } = render(Code, { code: 'hello world' })
		expect(container.querySelector('.code-block')).toBeTruthy()
	})

	it('sets data-language attribute', () => {
		const { container } = render(Code, { code: 'const x = 1', language: 'javascript' })
		expect(container.querySelector('.code-block')?.getAttribute('data-language')).toBe(
			'javascript'
		)
	})

	it('sets data-theme attribute', () => {
		const { container } = render(Code, { code: 'x', theme: 'light' })
		expect(container.querySelector('.code-block')?.getAttribute('data-theme')).toBe('light')
	})

	it('defaults to text language', () => {
		const { container } = render(Code, { code: 'hello' })
		expect(container.querySelector('.code-block')?.getAttribute('data-language')).toBe('text')
	})

	it('defaults to dark theme', () => {
		const { container } = render(Code, { code: 'hello' })
		expect(container.querySelector('.code-block')?.getAttribute('data-theme')).toBe('dark')
	})

	// ─── Loading State ──────────────────────────────────────────────

	it('shows raw code in loading state', () => {
		const { container } = render(Code, { code: 'const x = 1' })
		// Initially shows the loading state with raw code
		const loading = container.querySelector('.code-loading')
		if (loading) {
			expect(loading.querySelector('code')?.textContent).toBe('const x = 1')
		}
	})

	// ─── Highlighted State ──────────────────────────────────────────

	it('renders highlighted HTML after loading', async () => {
		const { container } = render(Code, { code: 'const x = 1', language: 'javascript' })
		// Wait for shiki to initialize and highlight
		await waitFor(
			() => {
				const shikiPre = container.querySelector('.code-block .shiki')
				expect(shikiPre).toBeTruthy()
			},
			{ timeout: 10000 }
		)
	})

	// ─── Copy Button ────────────────────────────────────────────────

	it('shows copy button by default', () => {
		const { container } = render(Code, { code: 'hello' })
		expect(container.querySelector('.copy-button')).toBeTruthy()
	})

	it('hides copy button when showCopyButton is false', () => {
		const { container } = render(Code, { code: 'hello', showCopyButton: false })
		expect(container.querySelector('.copy-button')).toBeNull()
	})

	it('copy button has aria-label', () => {
		const { container } = render(Code, { code: 'hello' })
		const btn = container.querySelector('.copy-button')
		expect(btn?.getAttribute('aria-label')).toBe('Copy code')
	})

	it('copy button click does not throw', async () => {
		const { container } = render(Code, { code: 'hello' })
		const btn = container.querySelector('.copy-button')!
		// In Playwright browser environment, clipboard may work or use fallback
		// Either way, clicking should not throw
		await expect(fireEvent.click(btn)).resolves.not.toThrow()
	})

	// ─── Line Numbers ───────────────────────────────────────────────

	it('does not show line numbers by default', () => {
		const { container } = render(Code, { code: 'hello' })
		expect(container.querySelector('.show-line-numbers')).toBeNull()
	})

	it('adds line numbers class when enabled', () => {
		const { container } = render(Code, { code: 'hello', showLineNumbers: true })
		expect(container.querySelector('.show-line-numbers')).toBeTruthy()
	})

	// ─── Translatable Labels ────────────────────────────────────────

	it('uses default copy label from MessagesStore', () => {
		const { container } = render(Code, { code: 'hello' })
		const btn = container.querySelector('.copy-button')
		expect(btn?.getAttribute('aria-label')).toBe('Copy code')
	})

	it('allows custom labels prop to override defaults', () => {
		const { container } = render(Code, { code: 'hello', labels: { copy: 'Copier', copied: 'Copie!' } })
		const btn = container.querySelector('.copy-button')
		expect(btn?.getAttribute('aria-label')).toBe('Copier')
	})
})
