import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, fireEvent, waitFor } from '@testing-library/svelte'
import { tick } from 'svelte'
import CodeBlockTest from './CodeBlockTest.svelte'

// Shiki is mocked so the two render branches become STATES we choose rather than
// a race we observe. The real `highlightCode` builds an expensive singleton
// highlighter: the first test pays initialisation, later ones hit the cache, so
// whether `highlighted` is set before a test ends depended on ordering and
// machine speed. That made this file's coverage differ between machines —
// CI measured 89.69% statements against 88.66% locally.
//
// shiki.ts keeps its own direct coverage via shiki.spec.svelte.ts, so mocking it
// here costs nothing.
const shiki = vi.hoisted(() => ({ highlightCode: vi.fn() }))
vi.mock('../src/utils/shiki.js', () => ({ highlightCode: shiki.highlightCode }))

const HIGHLIGHTED = '<pre class="shiki"><code><span data-token>const</span> x = 1</code></pre>'

/** Never settles — pins the component in its pre-highlight state. */
const pending = () => new Promise<string>(() => {})

beforeEach(() => {
	shiki.highlightCode.mockReset()
	shiki.highlightCode.mockResolvedValue(HIGHLIGHTED)
})

describe('CodeBlock', () => {
	// ─── Rendering ──────────────────────────────────────────────────

	it('renders a data-code-block container', () => {
		const { container } = render(CodeBlockTest, { props: { code: 'const x = 1' } })
		expect(container.querySelector('[data-code-block]')).toBeTruthy()
	})

	it('renders the fallback pre/code while shiki is still pending', async () => {
		shiki.highlightCode.mockReturnValue(pending())
		const { container } = render(CodeBlockTest, { props: { code: 'hello world' } })
		await tick()

		const pre = container.querySelector('pre[data-code-block-body]')
		expect(pre).toBeTruthy()
		expect(pre?.querySelector('code')?.textContent).toBe('hello world')
		expect(container.querySelector('.shiki')).toBeNull()
	})

	it('swaps the fallback for shiki output once it resolves', async () => {
		const { container } = render(CodeBlockTest, { props: { code: 'const x = 1' } })

		await waitFor(() => expect(container.querySelector('.shiki')).toBeTruthy())
		expect(container.querySelector('[data-code-block-body] [data-token]')).toBeTruthy()
		expect(container.querySelector('pre[data-code-block-body]')).toBeNull()
	})

	it('keeps the fallback when highlighting rejects', async () => {
		shiki.highlightCode.mockRejectedValue(new Error('no grammar'))
		const { container } = render(CodeBlockTest, { props: { code: 'hello world' } })

		await waitFor(() => expect(shiki.highlightCode).toHaveBeenCalled())
		await tick()
		expect(container.querySelector('pre[data-code-block-body] code')?.textContent).toBe(
			'hello world'
		)
		expect(container.querySelector('.shiki')).toBeNull()
	})

	it('passes the language and resolved theme through to shiki', async () => {
		render(CodeBlockTest, { props: { code: 'x', language: 'typescript', theme: 'light' } })

		await waitFor(() => expect(shiki.highlightCode).toHaveBeenCalled())
		expect(shiki.highlightCode).toHaveBeenCalledWith('x', { lang: 'typescript', theme: 'light' })
	})

	it('resolves theme="auto" from the body data-mode', async () => {
		document.body.dataset.mode = 'light'
		render(CodeBlockTest, { props: { code: 'x', language: 'ts', theme: 'auto' } })

		await waitFor(() =>
			expect(shiki.highlightCode).toHaveBeenCalledWith('x', { lang: 'ts', theme: 'light' })
		)
		delete document.body.dataset.mode
	})

	it('re-highlights when the body mode changes', async () => {
		document.body.dataset.mode = 'light'
		render(CodeBlockTest, { props: { code: 'x', language: 'ts', theme: 'auto' } })
		await waitFor(() => expect(shiki.highlightCode).toHaveBeenCalledTimes(1))

		// Covers the MutationObserver wired up in onMount.
		document.body.dataset.mode = 'dark'
		await waitFor(() =>
			expect(shiki.highlightCode).toHaveBeenLastCalledWith('x', { lang: 'ts', theme: 'dark' })
		)
		delete document.body.dataset.mode
	})

	it('shows the raw code text in the fallback', async () => {
		shiki.highlightCode.mockReturnValue(pending())
		const { container } = render(CodeBlockTest, { props: { code: 'hello world' } })
		await tick()

		expect(container.querySelector('[data-code-block-body]')?.textContent).toContain('hello world')
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

	it('renders no header when filename, language and every action are absent', () => {
		const { container } = render(CodeBlockTest, { props: { code: 'x', language: '' } })
		expect(container.querySelector('[data-code-block-header]')).toBeNull()
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
		const btn = container.querySelector('[data-code-block-actions] button[title="Copy code"]')
		expect(btn).toBeTruthy()
	})

	it('copy button has "Copy" label initially', () => {
		const { container } = render(CodeBlockTest, { props: { code: 'x', allowCopy: true } })
		expect(container.querySelector('button[title="Copy code"]')?.textContent).toContain('Copy')
	})

	it('writes the code to the clipboard and flips the label to Copied', async () => {
		const writeText = vi.fn().mockResolvedValue(undefined)
		const original = navigator.clipboard
		Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })

		const { container } = render(CodeBlockTest, { props: { code: 'hello', allowCopy: true } })
		const btn = container.querySelector('button[title="Copy code"]')!
		await fireEvent.click(btn)

		await waitFor(() => expect(btn.textContent).toContain('Copied'))
		expect(writeText).toHaveBeenCalledWith('hello')
		expect(btn.querySelector('.action-check')).toBeTruthy()

		Object.defineProperty(navigator, 'clipboard', { value: original, configurable: true })
	})

	it('reverts the Copied label after the 1500ms timeout', async () => {
		vi.useFakeTimers()
		const original = navigator.clipboard
		Object.defineProperty(navigator, 'clipboard', {
			value: { writeText: vi.fn().mockResolvedValue(undefined) },
			configurable: true
		})

		const { container } = render(CodeBlockTest, { props: { code: 'hello', allowCopy: true } })
		const btn = container.querySelector('button[title="Copy code"]')!
		await fireEvent.click(btn)

		// Flushes the await on clipboard.writeText without advancing the clock.
		await vi.advanceTimersByTimeAsync(0)
		await tick()
		expect(btn.textContent).toContain('Copied')

		await vi.advanceTimersByTimeAsync(1500)
		await tick()
		expect(btn.textContent).toContain('Copy')
		expect(btn.textContent).not.toContain('Copied')

		Object.defineProperty(navigator, 'clipboard', { value: original, configurable: true })
		vi.useRealTimers()
	})

	it('copy silently fails when the clipboard rejects, leaving the label alone', async () => {
		const original = navigator.clipboard
		Object.defineProperty(navigator, 'clipboard', {
			value: { writeText: vi.fn().mockRejectedValue(new Error('No clipboard')) },
			configurable: true
		})

		const { container } = render(CodeBlockTest, { props: { code: 'hello', allowCopy: true } })
		const btn = container.querySelector('button[title="Copy code"]')!
		await fireEvent.click(btn)
		await tick()

		expect(btn.textContent).toContain('Copy')
		expect(btn.textContent).not.toContain('Copied')

		Object.defineProperty(navigator, 'clipboard', { value: original, configurable: true })
	})

	// ─── Download button ──────────────────────────────────────────────

	it('renders download button when allowDownload=true', () => {
		const { container } = render(CodeBlockTest, {
			props: { code: 'x', allowDownload: true, language: 'ts' }
		})
		expect(container.querySelector('button[title="Download as file"]')).toBeTruthy()
	})

	it('download button shows language extension', () => {
		const { container } = render(CodeBlockTest, {
			props: { code: 'x', allowDownload: true, language: 'ts' }
		})
		expect(container.querySelector('button[title="Download as file"]')?.textContent).toContain('.ts')
	})

	it('downloads the code as a named blob', async () => {
		const createObjectURL = vi.fn(() => 'blob:test')
		const revokeObjectURL = vi.fn()
		const origCreate = URL.createObjectURL
		const origRevoke = URL.revokeObjectURL
		URL.createObjectURL = createObjectURL
		URL.revokeObjectURL = revokeObjectURL

		const { container } = render(CodeBlockTest, {
			props: { code: 'x', allowDownload: true, language: 'ts', filename: 'main.ts' }
		})
		await fireEvent.click(container.querySelector('button[title="Download as file"]')!)

		expect(createObjectURL).toHaveBeenCalledTimes(1)
		expect(createObjectURL.mock.calls[0][0]).toBeInstanceOf(Blob)
		expect(revokeObjectURL).toHaveBeenCalledWith('blob:test')

		URL.createObjectURL = origCreate
		URL.revokeObjectURL = origRevoke
	})

	// ─── Max height ───────────────────────────────────────────────────

	it('sets max-height style when height is provided', () => {
		const { container } = render(CodeBlockTest, { props: { code: 'x', height: '400px' } })
		expect((container.querySelector('[data-code-block]') as HTMLElement).style.maxHeight).toBe(
			'400px'
		)
	})

	it('does not set max-height when height is not provided', () => {
		const { container } = render(CodeBlockTest, { props: { code: 'x' } })
		expect((container.querySelector('[data-code-block]') as HTMLElement).style.maxHeight).toBe('')
	})

	// ─── Actions snippet ──────────────────────────────────────────────

	it('renders custom actions from test wrapper', () => {
		const { container } = render(CodeBlockTest, { props: { code: 'x', showActions: true } })
		expect(container.querySelector('[data-code-block-actions]')).toBeTruthy()
		expect(container.querySelector('[data-test-action]')).toBeTruthy()
	})
})
