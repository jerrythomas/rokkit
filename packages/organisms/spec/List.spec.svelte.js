import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import List from '../src/List.svelte'

describe('List', () => {
	it('should render', () => {
		const props = $state({ items: ['Item 1', 'Item 2'] })
		const { container } = render(List, props)
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
})
