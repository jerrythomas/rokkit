import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import MockItem from '../../src/components/MockItem.svelte'
import { flushSync } from 'svelte'

describe('MockItem', () => {
	it('should render', () => {
		const props = $state({ value: 'Hello' })
		const { container } = render(MockItem, { props })
		expect(container).toMatchSnapshot()
		props.value = 'World'
		flushSync()
		expect(container).toMatchSnapshot()
	})
})
