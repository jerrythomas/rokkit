import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import MockItem from '../../src/components/MockItem.svelte'

describe('MockItem', () => {
	it('should render', () => {
		const { getByText } = render(MockItem, { props: { value: 'Hello' } })
		expect(getByText('Hello')).toBeTruthy()
	})
})
