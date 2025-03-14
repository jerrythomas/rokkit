import { describe, expect, beforeEach, it } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import { flushSync, tick } from 'svelte'
import { types } from '../../src/input/types'
import Input from '../../src/input/Input.svelte'

describe('Input.svelte', () => {
	const names = Object.keys(types).filter((type) => type !== 'switch')
	const custom = {
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
			'checkbox',
			'color',
			'date',
			'date-time',
			'email',
			'file',
			'month',
			'number',
			'password',
			'radio',
			'range',
			'select',
			'tel',
			'text',
			'text-area',
			'time',
			'url',
			'week'
			// 'range-min-max',
			// 'rating',
			// 'switch'
		])
	})

	it.each(names)('should render "%s"', (name) => {
		const props = $state({
			name: 'foo',
			type: name,
			value: null,
			...custom[name]
		})
		const { container } = render(Input, { props })
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
	it('should render different input on type change', () => {
		const props = $state({
			type: 'text',
			value: null
		})
		const { container } = render(Input, { props })
		expect(container.querySelector('error')).toBeNull()
		expect(container).toMatchSnapshot()

		props.type = 'number'
		flushSync()
		expect(container.querySelector('error')).toBeNull()
		expect(container).toMatchSnapshot()
	})
})
