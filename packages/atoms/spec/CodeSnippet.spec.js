import { describe, expect, it, beforeEach } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import CodeSnippet from '../src/CodeSnippet.svelte'

describe('CodeSnippet.svelte', () => {
	beforeEach(() => cleanup())

	it('should render CodeSnippet text', () => {
		const { container } = render(CodeSnippet, {
			code: '<div>test</div>',
			language: 'html'
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
})
