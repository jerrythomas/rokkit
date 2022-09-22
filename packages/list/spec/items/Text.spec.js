import { describe, expect, it, beforeEach } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'

import Text from './Text.svelte'

describe('Text.svelte', () => {
	beforeEach(() => cleanup())

	it('Should render', () => {
		const { container } = render(Text, { content: 'hello' })
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})

	it('Should render object', () => {})
	it('Should render string', () => {})
	it('Should render icon', () => {})
	it('Should render image as icon', () => {})
	it('Should render content using component', () => {})
})
