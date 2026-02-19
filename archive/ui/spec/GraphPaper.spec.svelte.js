import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import { flushSync } from 'svelte'
import '@rokkit/helpers/mocks'
import GraphPaperUsage from './mocks/GraphPaperUsage.svelte'

describe('Shine', () => {
	it('should render', () => {
		const props = $state({})
		const { container } = render(GraphPaperUsage, { props })

		const node = container.querySelector('[data-graph-paper]')
		const getVar = (name) => getComputedStyle(node).getPropertyValue(name).trim()

		// Initial values
		expect(getVar('--minor-grid')).toBe('0.5px')
		expect(getVar('--major-grid')).toBe('0.5px')
		expect(getVar('--size')).toBe('calc( 5 * .5rem)')

		// Update major
		props.majorGridThickness = 2
		flushSync()
		expect(getVar('--minor-grid')).toBe('0.5px')
		expect(getVar('--major-grid')).toBe('2px')
		expect(getVar('--size')).toBe('calc( 5 * .5rem)')

		// Update group
		props.majorGridSize = 6
		props.unit = '1rem'
		props.minorGridThickness = 1
		flushSync()
		expect(getVar('--minor-grid')).toBe('1px')
		expect(getVar('--major-grid')).toBe('2px')
		expect(getVar('--size')).toBe('calc( 6 * 1rem)')
	})
})
