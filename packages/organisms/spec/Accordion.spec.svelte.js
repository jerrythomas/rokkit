import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import Accordion from '../src/Accordion.svelte'

describe('Accordion', () => {
	const items = [
		{ text: 'Item 1', children: [{ text: 'Child 1' }, { text: 'Child 2' }] },
		{ text: 'Item 2', children: [{ text: 'Child 3' }, { text: 'Child 4' }] }
	]
	it('should render', () => {
		const props = $state({ items })
		const { container } = render(Accordion, props)
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
})
