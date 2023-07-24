import { describe, expect, beforeEach, it } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import Message from '../src/Message.svelte'

describe('Message.svelte', () => {
	beforeEach(() => cleanup())

	it('should render empty', () => {
		const { container } = render(Message)
		expect(container).toMatchSnapshot()
	})

	it('should render error message', () => {
		const { container } = render(Message, { text: 'Error' })
		expect(container).toMatchSnapshot()
	})
	it('should render error message', () => {
		const { container } = render(Message, { text: 'Info', type: 'info' })
		expect(container).toMatchSnapshot()
	})
})
