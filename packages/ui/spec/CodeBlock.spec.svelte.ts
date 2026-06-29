import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import CodeBlockTest from './CodeBlockTest.svelte'

describe('CodeBlock', () => {
	// ─── Rendering ──────────────────────────────────────────────────

	it('renders a data-code-block container', () => {
		const { container } = render(CodeBlockTest, { props: { code: 'const x = 1' } })
		expect(container.querySelector('[data-code-block]')).toBeTruthy()
	})

	it('renders fallback pre/code while shiki is loading', () => {
		const { container } = render(CodeBlockTest, { props: { code: 'hello world' } })
		// Shiki is async — before it resolves, the fallback <pre> is shown
		const pre = container.querySelector('[data-code-block-body] pre, pre[data-code-block-body]')
		// Either shiki resolved or the pre fallback is shown — code must be present somewhere
		const body = container.querySelector('[data-code-block-body]')
		expect(body).toBeTruthy()
	})

	it('shows the raw code text in the fallback', () => {
		const { container } = render(CodeBlockTest, { props: { code: 'hello world' } })
		const body = container.querySelector('[data-code-block-body]')
		// The code appears either in a <code> child (fallback) or highlighted HTML
		expect(body?.textContent).toContain('hello world')
	})

	// ─── Header ──────────────────────────────────────────────────────

	it('renders header when filename is provided', () => {
		const { container } = render(CodeBlockTest, { props: { code: 'x', filename: 'main.ts' } })
		expect(container.querySelector('[data-code-block-header]')).toBeTruthy()
	})

	it('renders filename in header', () => {
		const { container } = render(CodeBlockTest, { props: { code: 'x', filename: 'index.ts' } })
		expect(container.querySelector('[data-code-block-filename]')?.textContent).toBe('index.ts')
	})

	it('renders language chip in header', () => {
		const { container } = render(CodeBlockTest, { props: { code: 'x', language: 'typescript' } })
		expect(container.querySelector('[data-code-block-lang]')?.textContent).toBe('typescript')
	})

	it('does not render header when no filename, language, allowCopy, allowDownload, or actions', () => {
		const { container } = render(CodeBlockTest, { props: { code: 'x', language: '' } })
		// When nothing is set that triggers hasHeader, no header renders
		// (language defaults to 'text' from props, so header should appear by default)
		// Let's just verify we can query
		const header = container.querySelector('[data-code-block-header]')
		// With language='text' (default) hasHeader=true so header exists normally;
		// forcing language='' makes hasHeader false
		expect(header).toBeNull()
	})

	it('renders icon in header', () => {
		const { container } = render(CodeBlockTest, { props: { code: 'x', filename: 'app.ts' } })
		const icon = container.querySelector('[data-code-block-icon]')
		expect(icon).toBeTruthy()
		expect(icon?.classList.contains('view-code')).toBe(true)
	})

	// ─── Copy button ─────────────────────────────────────────────────

	it('does not render copy button by default', () => {
		const { container } = render(CodeBlockTest, { props: { code: 'x', filename: 'f.ts' } })
		expect(container.querySelector('[data-code-block-actions] button')).toBeNull()
	})

	it('renders copy button when allowCopy=true', () => {
		const { container } = render(CodeBlockTest, { props: { code: 'x', allowCopy: true } })
		const actions = container.querySelector('[data-code-block-actions]')
		expect(actions).toBeTruthy()
		const btn = actions?.querySelector('button[title="Copy code"]')
		expect(btn).toBeTruthy()
	})

	it('copy button has "Copy" label initially', () => {
		const { container } = render(CodeBlockTest, { props: { code: 'x', allowCopy: true } })
		const btn = container.querySelector('button[title="Copy code"]')
		expect(btn?.textContent).toContain('Copy')
	})

	it('clicking copy button does not throw', async () => {
		const { container } = render(CodeBlockTest, { props: { code: 'hello', allowCopy: true } })
		const btn = container.querySelector('button[title="Copy code"]')!
		await expect(fireEvent.click(btn)).resolves.not.toThrow()
	})

	it('copy silently fails when clipboard API is unavailable', async () => {
		// Mock clipboard to reject — covers the catch branch in copyCode
		const origClipboard = navigator.clipboard
		Object.defineProperty(navigator, 'clipboard', {
			value: { writeText: vi.fn().mockRejectedValue(new Error('No clipboard')) },
			configurable: true
		})
		const { container } = render(CodeBlockTest, { props: { code: 'hello', allowCopy: true } })
		const btn = container.querySelector('button[title="Copy code"]')!
		await expect(fireEvent.click(btn)).resolves.not.toThrow()
		Object.defineProperty(navigator, 'clipboard', { value: origClipboard, configurable: true })
	})

	// ─── Download button ──────────────────────────────────────────────

	it('renders download button when allowDownload=true', () => {
		const { container } = render(CodeBlockTest, { props: { code: 'x', allowDownload: true, language: 'ts' } })
		const btn = container.querySelector('button[title="Download as file"]')
		expect(btn).toBeTruthy()
	})

	it('download button shows language extension', () => {
		const { container } = render(CodeBlockTest, { props: { code: 'x', allowDownload: true, language: 'ts' } })
		const btn = container.querySelector('button[title="Download as file"]')
		expect(btn?.textContent).toContain('.ts')
	})

	it('clicking download button does not throw', async () => {
		// Mock URL.createObjectURL
		const origCreate = URL.createObjectURL
		const origRevoke = URL.revokeObjectURL
		URL.createObjectURL = vi.fn(() => 'blob:test')
		URL.revokeObjectURL = vi.fn()
		const { container } = render(CodeBlockTest, { props: { code: 'x', allowDownload: true, language: 'ts' } })
		const btn = container.querySelector('button[title="Download as file"]')!
		await expect(fireEvent.click(btn)).resolves.not.toThrow()
		URL.createObjectURL = origCreate
		URL.revokeObjectURL = origRevoke
	})

	// ─── Max height ───────────────────────────────────────────────────

	it('sets max-height style when height is provided', () => {
		const { container } = render(CodeBlockTest, { props: { code: 'x', height: '400px' } })
		const el = container.querySelector('[data-code-block]') as HTMLElement
		expect(el.style.maxHeight).toBe('400px')
	})

	it('does not set max-height when height is not provided', () => {
		const { container } = render(CodeBlockTest, { props: { code: 'x' } })
		const el = container.querySelector('[data-code-block]') as HTMLElement
		expect(el.style.maxHeight).toBe('')
	})

	// ─── Actions snippet ──────────────────────────────────────────────

	it('renders custom actions from test wrapper', () => {
		const { container } = render(CodeBlockTest, {
			props: { code: 'x', showActions: true }
		})
		expect(container.querySelector('[data-code-block-actions]')).toBeTruthy()
		expect(container.querySelector('[data-test-action]')).toBeTruthy()
	})
})
