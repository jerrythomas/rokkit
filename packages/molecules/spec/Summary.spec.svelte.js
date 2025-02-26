import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import Summary from '../src/Summary.svelte'

describe('Summary', () => {
	it('should render', () => {
		const props = $state({ value: 'Item 1' })
		const { container } = render(Summary, props)
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
})
