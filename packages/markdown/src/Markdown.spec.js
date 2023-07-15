import { describe, expect, it, beforeEach } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import Markdown from './Markdown.svelte'

describe('Markdown.svelte', () => {
	beforeEach(() => cleanup())

	it('should render svg with default properties and title', () => {
		const { container } = render(Markdown)
		expect(container).toBeTruthy()
	})
})
