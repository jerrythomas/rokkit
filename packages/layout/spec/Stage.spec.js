import { describe, expect, beforeEach, it } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import Stage from '../src/Stage.svelte'

describe('Stage.svelte', () => {
	beforeEach(() => cleanup())

	it('should render', () => {
		const { container } = render(Stage)
		expect(container).toBeTruthy()
	})
})
