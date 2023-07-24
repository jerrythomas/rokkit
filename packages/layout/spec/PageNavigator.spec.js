import { describe, expect, beforeEach, it } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import PageNavigator from '../src/PageNavigator.svelte'

describe('PageNavigator.svelte', () => {
	beforeEach(() => cleanup())

	it('should render', () => {
		const { container } = render(PageNavigator)
		expect(container).toBeTruthy()
	})
})
