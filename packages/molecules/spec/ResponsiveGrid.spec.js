import { describe, expect, it, beforeEach } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import MockItem from './mocks/Custom.svelte'
import { tick } from 'svelte'
import ResponsiveGrid from '../src/ResponsiveGrid.svelte'

describe('ResponsiveGrid.svelte', () => {
	const items = [
		{ component: MockItem, props: { value: ' Content for A' } },
		{ component: MockItem, props: { value: ' Content for B' } },
		{ component: MockItem, props: { value: ' Content for B' } }
	]
	beforeEach(() => cleanup())
	it('should render a responsive grid', () => {
		const { container } = render(ResponsiveGrid, { items, value: items[0] })
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
})
