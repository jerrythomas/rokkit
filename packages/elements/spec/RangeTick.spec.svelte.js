import { describe, expect, it, beforeEach, vi } from 'vitest'
import { cleanup, render, fireEvent } from '@testing-library/svelte'
import { flushSync } from 'svelte'

import RangeTick from '../src/RangeTick.svelte'

describe('RangeTick.svelte', () => {
	beforeEach(() => cleanup())

	it('should render using value', () => {
		const props = $state({ value: 10 })
		const { container } = render(RangeTick, { props })
		expect(container).toMatchSnapshot()
		props.value = 20
		flushSync()
		expect(container).toMatchSnapshot()
	})

	it('should render with custom label', () => {
		const props = $state({ value: 10, label: 'Custom Label' })
		const { container } = render(RangeTick, { props })
		expect(container).toMatchSnapshot()

		props.label = ''
		flushSync()
		expect(container).toMatchSnapshot()

		props.label = null
		flushSync()
		expect(container).toMatchSnapshot()
	})

	it('should render as selected', () => {
		const props = $state({ value: 10, selected: true })
		const { container } = render(RangeTick, { props })
		expect(container).toMatchSnapshot()

		props.selected = false
		flushSync()
		expect(container).toMatchSnapshot()
	})

	it('should emit click event', () => {
		const props = $state({ value: 10, onclick: vi.fn() })
		const { container } = render(RangeTick, { props })

		fireEvent.click(container.querySelector('rk-tick'))
		expect(props.onclick).toHaveBeenCalled()
	})
})
