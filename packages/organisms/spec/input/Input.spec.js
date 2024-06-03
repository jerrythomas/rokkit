import { describe, expect, beforeEach, it } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import { tick } from 'svelte'
import { types } from '../../src/input/types'
import Input from '../../src/input/Input.svelte'

describe('Input.svelte', () => {
	const names = Object.keys(types)
	const props = {
		radio: { options: ['foo', 'bar', 'baz'] },
		'range-min-max': { min: 0, max: 100, value: [0, 100] },
		rating: { max: 10 },
		select: { options: ['foo', 'bar', 'baz'] },
		switch: { options: ['foo', 'bar', 'baz'] }
	}

	beforeEach(() => cleanup())

	it('should include all input types', () => {
		expect(names).toEqual([
			'string',
			'integer',
			'boolean',
			'enum',
			'phone',
			'color',
			'date',
			'date-time',
			'email',
			'file',
			'month',
			'number',
			'password',
			'tel',
			'text',
			'time',
			'url',
			'week',
			'text-area',
			'range',
			'select',
			'checkbox',
			'radio',
			'range-min-max',
			'rating',
			'switch'
		])
	})

	it.each(names)('should render "%s"', (name) => {
		const { container } = render(Input, {
			name: 'foo',
			type: name,
			value: null,
			...props[name]
		})
		expect(container).toMatchSnapshot()
	})

	it('should render error for invalid input type', () => {
		const { container } = render(Input, {
			type: 'foo',
			value: null
		})
		expect(container.querySelector('error').textContent).toEqual(
			'Type "foo" is not supported by Input'
		)
	})

	// unlikely to change, but just in case
	it('should render different input on type change', async () => {
		const { container, component } = render(Input, {
			type: 'text',
			value: null
		})
		expect(container.querySelector('error')).toBeNull()
		expect(container.querySelector('div').innerHTML).toMatchSnapshot()

		component.$set({ type: 'number' })
		await tick()
		expect(container.querySelector('error')).toBeNull()
		expect(container.querySelector('div').innerHTML).toMatchSnapshot()
	})
})
