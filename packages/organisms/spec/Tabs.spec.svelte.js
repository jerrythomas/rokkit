import { describe, it, expect, beforeEach } from 'vitest'
import { render, cleanup } from '@testing-library/svelte'
import Tabs from '../src/Tabs.svelte'
import { flushSync } from 'svelte'

describe('Tabs', () => {
	beforeEach(() => cleanup())

	it('should render simple list', () => {
		const props = $state({ items: ['Item 1', 'Item 2'], class: 'custom-class' })
		const { container } = render(Tabs, props)
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()

		props.class = 'another-class'
		flushSync()
		expect(container).toMatchSnapshot()
	})
})
