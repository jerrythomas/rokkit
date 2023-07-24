import { describe, expect, beforeEach, it } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import Sidebar from '../src/Sidebar.svelte'

describe('Sidebar.svelte', () => {
	beforeEach(() => cleanup())

	it('should render sidebar', () => {
		const { container } = render(Sidebar, {
			items: [{ name: 'Alpha' }, { name: 'Beta' }]
		})
		expect(container).toMatchSnapshot()
	})
})
