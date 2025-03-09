import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import { flushSync } from 'svelte'
import Item from '../src/Item.svelte'
import { FieldMapper } from '@rokkit/core'

describe('Item', () => {
	it('should render', () => {
		const props = $state({ value: 'Hello' })
		const { container } = render(Item, { props })
		expect(container).toMatchSnapshot()
		props.value = { text: 'World' }
		flushSync()
		expect(container).toMatchSnapshot()
	})

	it('should render with custom mapping', () => {
		const mapping = new FieldMapper({ icon: 'text' })
		const props = $state({ value: null, mapping })
		const { container } = render(Item, { props })
		expect(container).toMatchSnapshot()
		props.value = { text: 'World' }
		flushSync()
		expect(container).toMatchSnapshot()

		mapping.fields = { icon: 'icon' }
		props.value.image = 'world.png'
		flushSync()
		expect(container).toMatchSnapshot()
	})

	it('should render with icon', () => {
		const { container } = render(Item, { value: { text: 'Hello', icon: 'world' } })
		expect(container).toMatchSnapshot()
	})

	it('should render with image', () => {
		const { container } = render(Item, { value: { text: 'Hello', image: 'world.png' } })
		expect(container).toMatchSnapshot()
	})
})
