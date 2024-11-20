import { describe, expect, it, beforeEach, vi } from 'vitest'
import { cleanup, render, fireEvent } from '@testing-library/svelte'
import { tick } from 'svelte'
import MockItem from './mocks/MockItem.svelte'
import ListItems from '../src/ListItems.svelte'
import { defaultFields } from '@rokkit/core'

describe('ListItems.svelte', () => {
	beforeEach(() => {
		cleanup()
	})

	it('should render a list of values', () => {
		const { container } = render(ListItems, {
			props: {
				items: [1, 2, 3],
				fields: defaultFields,
				using: { default: MockItem },
				hierarchy: []
			}
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
})
