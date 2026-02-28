import { describe, expect, it, beforeEach } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import SymbolGrid from '../../src/elements/SymbolGrid.svelte'

describe('SymbolGrid.svelte', () => {
	beforeEach(() => cleanup())

	it('should render a grid of symbols', () => {
		const { container } = render(SymbolGrid)
		expect(container).toMatchSnapshot()
	})
})
