import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import { flushSync } from 'svelte'
import Item from '../src/Item.svelte'

describe('Item', () => {
	it('should render', () => {
		const props = $state({ value: { text: 'Hello' } })
		const { container } = render(Item, { props })
		expect(container).toMatchSnapshot()
		props.value = { text: 'World' }

		flushSync()
		expect(container).toMatchSnapshot()
	})

	it('should render with custom mapping', () => {
		const props = $state({ value: { text: 'World' }, fields: { icon: 'text' } })
		const { container } = render(Item, { props })

		expect(container).toMatchSnapshot()

		props.fields = { icon: 'icon' }
		props.value = { image: 'world.png' }
		flushSync()
		expect(container).toMatchSnapshot()
	})

	it('should render with icon', () => {
		const props = $state({ value: { text: 'Hello', icon: 'world' } })
		const { container } = render(Item, { props })
		expect(container).toMatchSnapshot()
	})

	it('should render with image', () => {
		const props = $state({ value: { text: 'Hello', image: 'world.png' } })
		const { container } = render(Item, { props })
		expect(container).toMatchSnapshot()
	})
})
