import { describe, expect, it, beforeEach } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import Markdown from '../src/Markdown.svelte'

describe('Markdown.svelte', () => {
	beforeEach(() => cleanup())

	it('Should render svg with default properties and title', () => {
		const { container } = render(Markdown)
		expect(container).toBeTruthy()
	})
})
