import { describe, expect, beforeEach, it } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import Message from '../src/Message.svelte'
import { StaticContent } from '@rokkit/helpers/components'
import { flushSync } from 'svelte'

describe('Message.svelte', () => {
	beforeEach(() => cleanup())

	it('should render empty', () => {
		const { container } = render(Message)
		expect(container).toMatchSnapshot()
	})

	it('should render error message', () => {
		const props = $state({ text: 'Error' })
		const { container } = render(Message, { props })
		expect(container).toMatchSnapshot()
	})
	it('should render error message', () => {
		const props = $state({ text: 'Info', type: 'info' })
		const { container } = render(Message, { props })
		expect(container).toMatchSnapshot()
		props.text = 'Warning'
		props.type = 'warning'
		flushSync()
		expect(container).toMatchSnapshot()
		props.text = 'Success'
		props.type = 'success'
		flushSync()
		expect(container).toMatchSnapshot()
		props.text = 'Info'
		props.type = 'info'
		flushSync()
		expect(container).toMatchSnapshot()
	})

	it('should render children', () => {
		const props = $state({ text: 'Info', type: 'info', children: StaticContent })
		const { container } = render(Message, { props })
		expect(container).toMatchSnapshot()
		props.type = 'warning'
		flushSync()
		expect(container).toMatchSnapshot()
		props.type = 'success'
		flushSync()
		expect(container).toMatchSnapshot()
		props.type = 'info'
		flushSync()
		expect(container).toMatchSnapshot()
	})
})
