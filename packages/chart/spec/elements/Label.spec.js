import { describe, expect, beforeEach, it } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import Label from '../../src/elements/Label.svelte'

describe('Label.svelte', () => {
	beforeEach(() => cleanup())

	it('should render', () => {
		const { container } = render(Label, { props: { x: 10, y: 20, text: 'Hello' } })
		expect(container).toMatchSnapshot()
	})
	it('should render with rotation', () => {
		const { container } = render(Label, { props: { x: 10, y: 20, text: 'Angled', angle: 45 } })
		expect(container).toMatchSnapshot()
	})
	it.each(['start', 'middle', 'end'])('should render with anchor %s', (anchor) => {
		const { container } = render(Label, { props: { x: 10, y: 20, text: anchor, anchor } })
		expect(container).toMatchSnapshot()
	})
})
