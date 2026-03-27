import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import MarkdownRenderer from '../src/MarkdownRenderer.svelte'
import StubPlugin from './fixtures/StubPlugin.svelte'

describe('MarkdownRenderer', () => {
	it('renders plain markdown as HTML', () => {
		const { container } = render(MarkdownRenderer, {
			props: { markdown: '**bold** and _italic_' }
		})
		expect(container.querySelector('strong')).toBeTruthy()
		expect(container.querySelector('em')).toBeTruthy()
	})

	it('renders a heading', () => {
		const { container } = render(MarkdownRenderer, {
			props: { markdown: '## Hello' }
		})
		expect(container.querySelector('h2')?.textContent).toContain('Hello')
	})

	it('renders an unknown code block as pre > code', () => {
		const { container } = render(MarkdownRenderer, {
			props: { markdown: '```python\nprint("hi")\n```' }
		})
		expect(container.querySelector('pre code')).toBeTruthy()
	})

	it('routes a recognised code block to a plugin component', () => {
		const { container } = render(MarkdownRenderer, {
			props: {
				markdown: '```plot\n{"data":[]}\n```',
				plugins: [{ language: 'plot', component: StubPlugin }]
			}
		})
		expect(container.querySelector('[data-stub-plugin]')).toBeTruthy()
	})

	it('falls back to code block when no plugin matches the language', () => {
		const { container } = render(MarkdownRenderer, {
			props: {
				markdown: '```table\n{"columns":[],"rows":[]}\n```',
				plugins: []
			}
		})
		expect(container.querySelector('pre')).toBeTruthy()
	})

	it('renders mixed content: text + plugin block + text', () => {
		const { container } = render(MarkdownRenderer, {
			props: {
				markdown: 'Before.\n\n```plot\n{"data":[]}\n```\n\nAfter.',
				plugins: [{ language: 'plot', component: StubPlugin }]
			}
		})
		expect(container.textContent).toContain('Before.')
		expect(container.textContent).toContain('After.')
		expect(container.querySelector('[data-stub-plugin]')).toBeTruthy()
	})

	it('renders with no plugins prop without error', () => {
		expect(() => render(MarkdownRenderer, { props: { markdown: '# Hello' } })).not.toThrow()
	})
})
