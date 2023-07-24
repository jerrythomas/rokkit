import { describe, expect, beforeEach, it } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import * as components from '../src/input'

describe('HTML Input', () => {
	const props = {
		InputRadio: { options: ['foo', 'bar', 'baz'] },
		InputSelect: { options: ['foo', 'bar', 'baz'] }
	}
	const names = Object.keys(components)
	const withProps = [
		['InputText', { minlength: 3, maxlength: 10, value: 'foo' }],
		['InputNumber', { min: 3, max: 10, value: 4 }],
		['InputCheckbox', { value: true }],
		[
			'InputRadio',
			{ value: 'foo', options: ['foo', 'bar', 'baz'], flip: true }
		],
		[
			'InputRadio',
			{
				options: [{ text: 'foo' }, { text: 'bar' }, { text: 'baz' }],
				value: 'foo'
			}
		],
		[
			'InputRadio',
			{
				options: [
					{ value: 1, text: 'foo' },
					{ value: 2, text: 'bar' },
					{ value: 3, text: 'baz' }
				],
				value: 'foo'
			}
		]
	]
	beforeEach(() => cleanup())

	it('should contain all exported components', () => {
		expect(names).toEqual([
			'InputColor',
			'InputDate',
			'InputDateTime',
			'InputEmail',
			'InputFile',
			'InputMonth',
			'InputNumber',
			'InputPassword',
			'InputTel',
			'InputText',
			'InputTime',
			'InputUrl',
			'InputWeek',
			'InputTextArea',
			'InputRange',
			'InputSelect',
			'InputCheckbox',
			'InputRadio'
		])
	})

	it.each(names)('should render "%s"', (name) => {
		const { container } = render(components[name], {
			value: null,
			...props[name]
		})
		const wrapper = container.childNodes[0]
		expect(wrapper.childNodes[0]).toMatchSnapshot()
	})

	it.each(names)('should render "%s" as readonly', (name) => {
		const { container } = render(components[name], {
			value: null,
			readonly: true,
			...props[name]
		})
		const wrapper = container.childNodes[0]
		expect(wrapper.childNodes[0]).toMatchSnapshot()
	})

	it.each(names)('should render "%s" as required', (name) => {
		const { container } = render(components[name], {
			value: null,
			required: true,
			...props[name]
		})
		const wrapper = container.childNodes[0]
		expect(wrapper.childNodes[0]).toMatchSnapshot()
	})

	it.each(withProps)('should render "%s" with custom props', (name, props) => {
		const { container } = render(components[name], props)
		const wrapper = container.childNodes[0]
		expect(wrapper.childNodes[0]).toMatchSnapshot()
	})

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
