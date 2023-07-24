import { describe, expect, beforeEach, it } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import { types } from '../src/input/types'
import Input from '../src/input/Input.svelte'

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
			type: name,
			value: null,
			...props[name]
		})
		expect(container).toMatchSnapshot()
	})
})
