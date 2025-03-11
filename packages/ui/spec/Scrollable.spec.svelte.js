import { describe, expect, beforeEach, it } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import Scrollable from '../src/Scrollable.svelte'
import { StaticContent } from '@rokkit/helpers/components'
import { flushSync } from 'svelte'

describe('Scrollable.svelte', () => {
	beforeEach(() => cleanup())

	it('should render', () => {
		const props = $state({ class: '', children: StaticContent })
		const { container } = render(Scrollable, { props })
		expect(container).toMatchSnapshot()

		props.class = 'custom-class'
		flushSync()
		expect(container).toMatchSnapshot()
	})
})
