import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, waitFor } from '@testing-library/svelte'
import MermaidPlugin from '../src/MermaidPlugin.svelte'

// `vi.hoisted` because the `vi.mock` factory is hoisted above these bindings —
// a plain `const` would be in the temporal dead zone when the factory runs.
const mermaid = vi.hoisted(() => ({
	initialize: vi.fn(),
	render: vi.fn()
}))

vi.mock('mermaid', () => ({ default: mermaid }))

beforeEach(() => {
	mermaid.initialize.mockClear()
	mermaid.render.mockReset().mockResolvedValue({ svg: '<svg><rect /></svg>' })
})

describe('MermaidPlugin', () => {
	// Every assertion on rendered output goes through waitFor. The component does
	// its work in an async onMount that awaits `import('mermaid')` and
	// `import('dompurify')`, so nothing below that await has run when render()
	// returns. Asserting synchronously does not merely miss the result — it makes
	// the test a race, and coverage of this file then varies with machine speed:
	// CI measured 38.46% statements where a laptop measured 53.84%.
	it('renders a mermaid container div before any async work completes', async () => {
		const { container } = render(MermaidPlugin, { props: { code: 'graph TD; A-->B' } })

		// Asserted synchronously on purpose: the container is the pre-render
		// placeholder and must exist without waiting.
		expect(container.querySelector('[data-mermaid-block]')).toBeTruthy()

		// Then drained, so this test's in-flight onMount cannot resolve during the
		// NEXT test and inflate its call counts past the beforeEach reset. That
		// leak is what the original single synchronous test left behind.
		await waitFor(() => expect(mermaid.render).toHaveBeenCalled())
	})

	it('initializes mermaid with startOnLoad disabled', async () => {
		render(MermaidPlugin, { props: { code: 'graph TD; A-->B' } })

		await waitFor(() => expect(mermaid.initialize).toHaveBeenCalledTimes(1))
		expect(mermaid.initialize).toHaveBeenCalledWith({ startOnLoad: false, theme: 'default' })
	})

	it('renders the code through mermaid under a unique id', async () => {
		render(MermaidPlugin, { props: { code: 'graph TD; A-->B' } })

		await waitFor(() => expect(mermaid.render).toHaveBeenCalledTimes(1))
		const [id, code] = mermaid.render.mock.calls[0]
		expect(id).toMatch(/^mermaid-/)
		expect(code).toBe('graph TD; A-->B')
	})

	it('injects the sanitized svg into the block', async () => {
		const { container } = render(MermaidPlugin, { props: { code: 'graph TD; A-->B' } })

		await waitFor(() => expect(container.querySelector('[data-mermaid-block] svg')).toBeTruthy())
		expect(container.querySelector('[data-mermaid-block] rect')).toBeTruthy()
		expect(container.querySelector('[data-block-error]')).toBeNull()
	})

	it('strips scripted markup from mermaid output before injecting it', async () => {
		// The sanitize call is the reason dompurify is a dependency at all, so it
		// gets an assertion rather than being taken on trust.
		mermaid.render.mockResolvedValue({
			svg: '<svg><rect /><script>globalThis.__pwned = true</script></svg>'
		})
		const { container } = render(MermaidPlugin, { props: { code: 'graph TD; A-->B' } })

		await waitFor(() => expect(container.querySelector('[data-mermaid-block] svg')).toBeTruthy())
		expect(container.querySelector('[data-mermaid-block] script')).toBeNull()
	})

	it('shows the error branch when mermaid rejects', async () => {
		mermaid.render.mockRejectedValue(new Error('bad graph'))
		const { container } = render(MermaidPlugin, { props: { code: 'not a graph' } })

		await waitFor(() => expect(container.querySelector('[data-block-error]')).toBeTruthy())
		expect(container.textContent).toContain('Mermaid error: bad graph')
		expect(container.querySelector('[data-mermaid-block]')).toBeNull()
	})

	it('falls back to a generic message when the rejection is not an Error', async () => {
		mermaid.render.mockRejectedValue('just a string')
		const { container } = render(MermaidPlugin, { props: { code: 'not a graph' } })

		await waitFor(() => expect(container.querySelector('[data-block-error]')).toBeTruthy())
		expect(container.textContent).toContain('Mermaid render failed')
	})

	it('keeps the raw code available in the error details', async () => {
		mermaid.render.mockRejectedValue(new Error('bad graph'))
		const { container } = render(MermaidPlugin, { props: { code: 'not a graph' } })

		await waitFor(() => expect(container.querySelector('[data-block-error]')).toBeTruthy())
		expect(container.querySelector('[data-block-error] pre')?.textContent).toBe('not a graph')
	})
})
