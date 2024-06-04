import { describe, expect, it, beforeEach } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import Markdown from './Markdown.svelte'

describe('Markdown.svelte', () => {
	beforeEach(() => cleanup())

	it('should render empty content', () => {
		const { container } = render(Markdown)
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
	it('should render markdown text', () => {
		const { container } = render(Markdown, { content: '# test' })
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
})
