import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import MockItem from '../../src/components/MockItem.svelte'
import { flushSync } from 'svelte'

describe('MockItem', () => {
	it('should render a string', () => {
		const props = $state({ value: 'Hello' })
		const { container } = render(MockItem, { props })
		expect(container).toMatchSnapshot()

		props.value = 'World'
		flushSync()

		expect(container).toMatchSnapshot()
	})

	it('should render an object', () => {
		const props = $state({ value: { text: 'Hello' } })

		const { container } = render(MockItem, { props })
		expect(container).toMatchSnapshot()
		props.value = { text: 'World' }
		flushSync()

		expect(container).toMatchSnapshot()
	})
})
