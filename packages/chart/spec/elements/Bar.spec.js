import { describe, expect, beforeEach, it } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import Bar from '../../src/elements/Bar.svelte'

describe('Bar.svelte', () => {
	beforeEach(() => cleanup())

	it('should render a bar', () => {
		// const { container } = render(Bar, { props: { x: 10, y: 20, width: 30, height: 40 } })
		// expect(container).toMatchSnapshot()
	})

	it('should render a bar with text', () => {
		// const { container } = render(Bar, { props: { x: 10, y: 20, width: 30, height: 40 } })
		// expect(container).toMatchSnapshot()
	})
})
