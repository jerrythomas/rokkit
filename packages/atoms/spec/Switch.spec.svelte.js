import { describe, it, expect } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import Switch from '../src/Switch.svelte'
import { FieldMapper } from '@rokkit/core'
import Item from '../src/Item.svelte'
import { flushSync, tick } from 'svelte'

describe('Switch', () => {
	const fields = new FieldMapper({ icon: 'text' }, { default: Item })
	const nextKeys = ['ArrowDown', 'ArrowRight', 'Enter', ' ']
	const prevKeys = ['ArrowUp', 'ArrowLeft']

	it('should render', () => {
		const props = $state({ value: null })
		const { container } = render(Switch, { props })
		const switchElement = container.querySelector('rk-switch')
		expect(switchElement).toBeTruthy()
		// expect(switchElement).toHaveAttribute('role', 'listbox')
		expect(switchElement).toMatchSnapshot()

		props.class = 'small'
		flushSync()
		expect(switchElement.classList).toContain('small')
	})

	it('should render with error for invalid options', () => {
		const { container } = render(Switch, { options: ['a'] })
		const switchElement = container.querySelector('rk-switch')
		expect(switchElement).toBeFalsy()
		expect(switchElement).toMatchSnapshot()
	})
	it('should render with options', () => {
		const { container } = render(Switch, { props: { options: ['a', 'b'], fields } })
		const switchElement = container.querySelector('rk-switch')
		expect(switchElement).toBeTruthy()
		expect(switchElement).toMatchSnapshot()
	})

	it('should render with object options', () => {
		const mapper = new FieldMapper({ icon: 'text' }, { default: Item })
		const { container } = render(Switch, {
			value: { text: 'sun' },
			options: [{ text: 'sun' }, { text: 'moon' }],
			fields: mapper
		})

		const switchElement = container.querySelector('rk-switch')
		expect(switchElement).toBeTruthy()
		expect(switchElement).toMatchSnapshot()
	})

	it('should switch options on click', async () => {
		const props = $state({
			value: null,
			options: [{ text: 'sun' }, { text: 'moon' }],
			fields,
			onchange: vi.fn()
		})
		const { container } = render(Switch, { props })
		const items = container.querySelectorAll('rk-item')
		expect(items.length).toBe(2)
		fireEvent.click(items[0])
		await tick()

		expect(container).toMatchSnapshot()
		expect(props.value).toEqual({ text: 'sun' })
		expect(props.onchange).toHaveBeenCalledWith({ text: 'sun' })

		fireEvent.click(items[1])
		await tick()
		expect(container).toMatchSnapshot()
		expect(props.value).toEqual({ text: 'moon' })
		expect(props.onchange).toHaveBeenCalledWith({ text: 'moon' })
	})

	it.each(nextKeys)('should switch options on keydown %s', async (key) => {
		const props = $state({
			value: null,
			options: [{ text: 'sun' }, { text: 'moon' }],
			fields,
			onchange: vi.fn()
		})
		const { container } = render(Switch, { props })
		const switchElement = container.querySelector('rk-switch')

		fireEvent.keyUp(switchElement, { key })
		await tick()
		expect(container).toMatchSnapshot()
		expect(props.value).toEqual({ text: 'sun' })
		expect(props.onchange).toHaveBeenCalledWith({ text: 'sun' })

		fireEvent.keyUp(switchElement, { key })
		await tick()
		expect(container).toMatchSnapshot()
		expect(props.value).toEqual({ text: 'moon' })
		expect(props.onchange).toHaveBeenCalledWith({ text: 'moon' })

		fireEvent.keyUp(switchElement, { key })
		await tick()
		expect(container).toMatchSnapshot()
		expect(props.value).toEqual({ text: 'sun' })
	})

	it.each(prevKeys)('should switch options on keydown %s', async (key) => {
		const props = $state({
			value: null,
			options: [{ text: 'sun' }, { text: 'moon' }, { text: 'earth' }],
			fields,
			onchange: vi.fn()
		})
		const { container } = render(Switch, { props })
		const switchElement = container.querySelector('rk-switch')

		fireEvent.keyUp(switchElement, { key })
		await tick()
		expect(container).toMatchSnapshot()
		expect(props.value).toEqual({ text: 'earth' })
		expect(props.onchange).toHaveBeenCalledWith({ text: 'earth' })

		fireEvent.keyUp(switchElement, { key })
		await tick()
		expect(container).toMatchSnapshot()
		expect(props.value).toEqual({ text: 'moon' })
		expect(props.onchange).toHaveBeenCalledWith({ text: 'moon' })

		fireEvent.keyUp(switchElement, { key })
		await tick()
		expect(container).toMatchSnapshot()
		expect(props.value).toEqual({ text: 'sun' })
		expect(props.onchange).toHaveBeenCalledWith({ text: 'sun' })
	})
})
