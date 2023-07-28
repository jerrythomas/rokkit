import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import { getPropertyValue } from '../src/helpers'
import MockItem from '../src/components/MockItem.svelte'

describe('getPropertyValue', () => {
	it('should return the value of the property', () => {
		const { component } = render(MockItem, { value: 'foo' })
		expect(getPropertyValue(component, 'value')).toBe('foo')
	})
})
