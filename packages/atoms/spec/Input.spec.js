import { describe, expect, beforeEach, it } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
// skipcq: JS-C1003 - Importing all components for verification
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
		['InputRadio', { value: 'foo', options: ['foo', 'bar', 'baz'], flip: true }],
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
		// skipcq: JS-E1007
		const { container } = render(components[name], {
			value: null,
			...props[name]
		})
		const wrapper = container.childNodes[0]
		expect(wrapper.childNodes[0]).toMatchSnapshot()
	})

	it.each(names)('should render "%s" as readonly', (name) => {
		// skipcq: JS-E1007
		const { container } = render(components[name], {
			value: null,
			readonly: true,
			...props[name]
		})
		const wrapper = container.childNodes[0]
		expect(wrapper.childNodes[0]).toMatchSnapshot()
	})

	it.each(names)('should render "%s" as required', (name) => {
		// skipcq: JS-E1007
		const { container } = render(components[name], {
			value: null,
			required: true,
			...props[name]
		})
		const wrapper = container.childNodes[0]
		expect(wrapper.childNodes[0]).toMatchSnapshot()
	})

	it.each(withProps)('should render "%s" with custom props', (name, props) => {
		// skipcq: JS-E1007
		const { container } = render(components[name], props)
		const wrapper = container.childNodes[0]
		expect(wrapper.childNodes[0]).toMatchSnapshot()
	})
})
