import { describe, expect, it, beforeEach, vi } from 'vitest'
import { cleanup, render, fireEvent } from '@testing-library/svelte'
import { tick } from 'svelte'
import { MockItem } from '@rokkit/helpers/components'
import ListItems from '../src/ListItems.svelte'
import Item from '../src/Item.svelte'
import { FieldMapper } from '@rokkit/core'

describe('ListItems.svelte', () => {
	const defaultMapping = new FieldMapper()
	defaultMapping.componentMap = { default: Item }

	beforeEach(() => {
		cleanup()
	})

	it('should render a list of values', () => {
		const props = $state({
			items: [1, 2, 3],
			value: null,
			mapping: defaultMapping
		})
		const { container } = render(ListItems, { props })
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})

	it('should render with custom component', () => {
		const mapping = new FieldMapper()
		mapping.componentMap = { default: Item, mock: MockItem }

		const props = $state({
			items: [{ text: 'A', component: 'mock' }, { text: 'B' }, { text: 'C' }],
			value: null,
			mapping
		})
		const { container } = render(ListItems, { props })
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
})
