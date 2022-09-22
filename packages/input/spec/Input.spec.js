import { describe, expect, beforeEach, it } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import Input from '../src/Input.svelte'
import { wrappedInput } from '../src/types'

describe('Input.svelte', () => {
	const types = Object.keys(wrappedInput)
	const withProps = [
		['text', { minlength: 3, maxlength: 10, value: 'foo' }],
		['number', { min: 3, max: 10, value: 4 }],
		['rating', { max: 3, value: 2, name: 'rating' }]
	]
	beforeEach(() => cleanup())

	it('should render text input', () => {
		const { container } = render(Input, { value: null })
		const wrapper = container.childNodes[0]
		expect(wrapper.innerHTML).toEqual('<input type="text">')
	})

	it.each(types)('should render input for type "%s"', (type) => {
		const { container } = render(Input, { type, value: null })
		const wrapper = container.childNodes[0]
		expect(wrapper.childNodes[0]).toMatchSnapshot()
	})

	it.each(types.filter((type) => type !== 'rating'))(
		'should render input for type "%s" as readonly',
		(type) => {
			const { container } = render(Input, {
				type,
				value: null,
				readonly: true
			})
			const wrapper = container.childNodes[0]
			expect(wrapper.childNodes[0]).toMatchSnapshot()
		}
	)

	it.each(types)('should render input for type "%s" as required', (type) => {
		const { container } = render(Input, {
			type,
			value: null,
			readonly: true
		})
		const wrapper = container.childNodes[0]
		expect(wrapper.childNodes[0]).toMatchSnapshot()
	})

	it.each(withProps)(
		'should render input for type "%s" with custom props',
		(type, props) => {
			const { container } = render(Input, {
				type,
				...props
			})
			const wrapper = container.childNodes[0]
			expect(wrapper.childNodes[0]).toMatchSnapshot()
		}
	)

	// it('should render text input as required', () => {
	// 	const { container } = render(Input, {
	// 		value: 'foo',
	// 		required: true
	// 	})
	// 	const wrapperDiv = container.childNodes[0]
	// 	expect(wrapperDiv.innerHTML).toEqual('<input type="text" required="">')
	// })

	// it('should render text input with length limits', () => {
	// 	const { container } = render(Input, {
	// 		value: 'foo',
	// 		minlength: 3,
	// 		maxlength: 10
	// 	})
	// 	const wrapperDiv = container.childNodes[0]
	// 	expect(wrapperDiv.innerHTML).toEqual(
	// 		'<input type="text" minlength="3" maxlength="10">'
	// 	)
	// })
})
