import { describe, expect, beforeEach, it } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import CheckBoxGroup from './CheckBoxGroup.svelte'

describe('CheckBoxGroup.svelte', () => {
	beforeEach(() => cleanup())

	it('should render the navigation CheckBoxGroup', () => {
		const { container } = render(CheckBoxGroup, { name: 'CheckBoxGroup' })
		expect(container).toBeTruthy()
	})
})
