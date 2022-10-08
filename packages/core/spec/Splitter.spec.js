import { describe, expect, beforeEach, it } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import Splitter from '../src/Splitter.svelte'

describe('Splitter.svelte', () => {
	beforeEach(() => cleanup())

	it('should render the navigation Splitter', () => {
		const { container } = render(Splitter)
		expect(container).toBeTruthy()
	})
})
