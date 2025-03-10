import { describe, it, expect, beforeEach } from 'vitest'
import { render, cleanup } from '@testing-library/svelte'
import Accordion from '../src/Accordion.svelte'
import { flushSync } from 'svelte'

describe('Accordion', () => {
	const items = [
		{ text: 'Item 1', children: [{ text: 'Child 1' }, { text: 'Child 2' }] },
		{ text: 'Item 2', children: [{ text: 'Child 3' }, { text: 'Child 4' }] }
	]
	beforeEach(() => cleanup())

	it('should render accordion', () => {
		const props = $state({ items })
		const { container } = render(Accordion, props)
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()

		props.class = 'another-class'
		flushSync()
		expect(container).toMatchSnapshot()
	})
})
