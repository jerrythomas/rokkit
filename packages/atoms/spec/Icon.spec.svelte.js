import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import { flushSync } from 'svelte'
import Icon from '../src/Icon.svelte'

describe('Icon', () => {
	it('should render', () => {
		const { container } = render(Icon)
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})

	it('should render with props', () => {
		const props = $state({
			name: 'home'
		})
		const { container } = render(Icon, { props })
		expect(container).toMatchSnapshot()

		props.name = 'settings'
		flushSync()
		expect(container).toMatchSnapshot()

		props.class = 'small'
		flushSync()
		expect(container).toMatchSnapshot()

		props.label = 'Settings'
		flushSync()
		expect(container).toMatchSnapshot()
	})
})
