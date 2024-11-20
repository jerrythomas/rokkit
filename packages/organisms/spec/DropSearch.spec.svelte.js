import { describe, expect, it, beforeEach } from 'vitest'
import { cleanup, fireEvent, render } from '@testing-library/svelte'

import DropSearch from '../src/DropSearch.svelte'
import { tick } from 'svelte'
import MockItem from './mocks/MockItem.svelte'
import 'validators/mocks'

describe('DropSearch.svelte', () => {
	beforeEach(() => cleanup())

	it('should render', async () => {
		const options = [{ text: 1 }, { text: 2 }, { text: 3 }]
		const { container } = render(DropSearch, { options, value: null })
		expect(container).toBeTruthy()
		container.querySelector('input-select').focus()
		await tick()
		expect(container).toMatchSnapshot()
	})

	it('should filter options by search text', async () => {
		const options = [{ text: 'Alpha' }, { text: 'Beta' }, { text: 'Charlie' }]
		const { container } = render(DropSearch, { options, value: null })
		expect(container).toBeTruthy()
		container.querySelector('input-select').focus()
		await tick()
		const searchBox = container.querySelector('selected-item input')
		await fireEvent.change(searchBox)
		await tick()
		let items = container.querySelectorAll('list item')
		expect(items.length).toBe(3)

		searchBox.value = 'ha'
		await fireEvent.change(searchBox)
		await tick()
		items = container.querySelectorAll('list item')
		expect(items.length).toBe(2)
	})

	it('should work with custom components', async () => {
		const options = [{ name: 'Alpha' }, { name: 'Beta' }, { name: 'Charlie' }]
		const props = $state({
			options,
			value: null,
			fields: { text: 'name' }
		})
		const { container } = render(DropSearch, { props })
		expect(container).toBeTruthy()

		props.using = { default: MockItem }
		await tick()
		container.querySelector('input-select').focus()
		await tick()

		expect(container).toMatchSnapshot()
		let items = container.querySelectorAll('list item')
		expect(items.length).toBe(3)

		const searchBox = container.querySelector('selected-item input')
		searchBox.value = null
		await fireEvent.change(searchBox)
		await tick()

		searchBox.value = 'ha'
		await fireEvent.change(searchBox)
		await tick()
		items = container.querySelectorAll('list item')
		expect(items.length).toBe(2)
	})
})
