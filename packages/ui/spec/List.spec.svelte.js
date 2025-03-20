import { describe, it, expect, beforeEach } from 'vitest'
import { render, cleanup } from '@testing-library/svelte'
import List from '../src/List.svelte'
import { flushSync } from 'svelte'
import CustomList from './mocks/CustomList.svelte'

describe('List', () => {
	const items = [
		{ text: 'Item 1', component: 'odd' },
		{ text: 'Item 2', component: 'even' },
		{ text: 'Item 3', component: 'default' },
		{ text: 'Item 4', component: 'odd' }
	]
	beforeEach(() => cleanup())
	it('should render empty list', () => {
		const props = $state({ items: [] })
		const { container } = render(List, props)
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
	it('should render simple list', () => {
		const props = $state({ items: [{ text: 'Item 1' }, { text: 'Item 2' }], class: 'custom-class' })
		const { container } = render(List, props)
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()

		props.class = 'another-class'
		flushSync()
		expect(container).toMatchSnapshot()
	})

	it('should render with custom header', () => {
		const props = $state({ items, addheader: true })
		const { container } = render(CustomList, props)
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
		const element = container.querySelector('rk-header')
		expect(element.textContent).toEqual('Custom header')
	})

	it('should render with custom footer', () => {
		const props = $state({ items, addfooter: true })
		const { container } = render(CustomList, props)
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
		const element = container.querySelector('rk-footer')
		expect(element.textContent).toEqual('Custom footer')
	})
	it('should render with custom empty', () => {
		const props = $state({ items: [], addempty: true })
		const { container } = render(CustomList, props)
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
	it('should render with custom components', () => {
		const props = $state({ items, mixed: true })
		const { container } = render(CustomList, props)
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
})
