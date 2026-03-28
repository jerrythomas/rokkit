import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import MarkdownRenderer from '../src/MarkdownRenderer.svelte'
import StubPlugin from './fixtures/StubPlugin.svelte'
import CrossFilterStub from './fixtures/CrossFilterStub.svelte'

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

describe('MarkdownRenderer — CrossFilter grouping', () => {
	const plotPlugins = [{ language: 'plot', component: StubPlugin }]

	it('wraps co-grouped plot blocks in a crossfilterWrapper', () => {
		const md = [
			'```plot',
			'{"data":[],"crossfilter":"group1"}',
			'```',
			'',
			'```plot',
			'{"data":[],"crossfilter":"group1"}',
			'```'
		].join('\n')
		const { container } = render(MarkdownRenderer, {
			props: { markdown: md, plugins: plotPlugins, crossfilterWrapper: CrossFilterStub }
		})
		expect(container.querySelectorAll('[data-crossfilter-group]')).toHaveLength(1)
		expect(container.querySelectorAll('[data-stub-plugin]')).toHaveLength(2)
	})

	it('creates separate groups for different crossfilter IDs', () => {
		const md = [
			'```plot',
			'{"data":[],"crossfilter":"g1"}',
			'```',
			'',
			'```plot',
			'{"data":[],"crossfilter":"g2"}',
			'```'
		].join('\n')
		const { container } = render(MarkdownRenderer, {
			props: { markdown: md, plugins: plotPlugins, crossfilterWrapper: CrossFilterStub }
		})
		expect(container.querySelectorAll('[data-crossfilter-group]')).toHaveLength(2)
	})

	it('does not group plots without crossfilter field', () => {
		const md = ['```plot', '{"data":[]}', '```'].join('\n')
		const { container } = render(MarkdownRenderer, {
			props: { markdown: md, plugins: plotPlugins, crossfilterWrapper: CrossFilterStub }
		})
		expect(container.querySelectorAll('[data-crossfilter-group]')).toHaveLength(0)
		expect(container.querySelectorAll('[data-stub-plugin]')).toHaveLength(1)
	})

	it('ignores crossfilterWrapper when not provided', () => {
		const md = [
			'```plot',
			'{"data":[],"crossfilter":"group1"}',
			'```',
			'',
			'```plot',
			'{"data":[],"crossfilter":"group1"}',
			'```'
		].join('\n')
		const { container } = render(MarkdownRenderer, {
			props: { markdown: md, plugins: plotPlugins }
		})
		// No crossfilter wrapper — renders normally without grouping
		expect(container.querySelectorAll('[data-crossfilter-group]')).toHaveLength(0)
		expect(container.querySelectorAll('[data-stub-plugin]')).toHaveLength(2)
	})
})
