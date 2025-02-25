import { describe, it, expect } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import { flushSync, tick } from 'svelte'
import Toggle from '../src/Toggle.svelte'
import { FieldMapper } from '@rokkit/core'
import { Item } from '@rokkit/atoms'

describe('Toggle', () => {
	const fields = new FieldMapper({ icon: 'text' }, { default: Item })
	const nextKeys = ['ArrowDown', 'ArrowRight']
	const prevKeys = ['ArrowUp', 'ArrowLeft']

	it('should render', () => {
		const props = $state({ value: null })
		const { container } = render(Toggle, { props })
		const toggleButton = container.querySelector('rk-toggle')
		expect(toggleButton).toBeTruthy()
		expect(toggleButton).toMatchSnapshot()

		props.class = 'small'
		flushSync()
		expect(toggleButton.classList).toContain('small')

		props.class = 'medium'
		flushSync()
		expect(toggleButton.classList).toContain('medium')
	})

	it('should render with options', () => {
		const { container } = render(Toggle, { options: ['a', 'b'] })
		const toggleButton = container.querySelector('rk-toggle > button')
		expect(toggleButton).toBeTruthy()
		expect(toggleButton).toMatchSnapshot()
	})

	it('should render with object options', () => {
		const mapper = new FieldMapper({ icon: 'text' })
		const { container } = render(Toggle, {
			value: { text: 'sun' },
			options: [{ text: 'sun' }, { text: 'moon' }],
			fields: mapper
		})

		const toggleButton = container.querySelector('rk-toggle > button')
		expect(toggleButton).toBeTruthy()
		expect(toggleButton).toMatchSnapshot()
	})

	it('should switch options on click', async () => {
		const props = $state({
			value: null,
			options: [{ text: 'sun' }, { text: 'moon' }],
			fields,
			onchange: vi.fn()
		})
		const { container } = render(Toggle, { props })
		const button = container.querySelector('rk-toggle > button')

		fireEvent.click(button)
		await tick()

		expect(container).toMatchSnapshot()
		expect(props.value).toEqual({ text: 'sun' })
		expect(props.onchange).toHaveBeenCalledWith({ text: 'sun' })

		fireEvent.click(button)
		await tick()
		expect(container).toMatchSnapshot()
		expect(props.value).toEqual({ text: 'moon' })
		expect(props.onchange).toHaveBeenCalledWith({ text: 'moon' })

		fireEvent.click(button)
		await tick()
		expect(container).toMatchSnapshot()
		expect(props.value).toEqual({ text: 'sun' })
		expect(props.onchange).toHaveBeenCalledWith({ text: 'sun' })
	})

	// space and enter are handled by the browser for button
	it.each(nextKeys)('should switch options on keydown %s', async (key) => {
		const props = $state({
			value: null,
			options: [{ text: 'sun' }, { text: 'moon' }],
			fields,
			onchange: vi.fn()
		})
		const { container } = render(Toggle, { props })
		const toggleButton = container.querySelector('rk-toggle > button')

		fireEvent.keyUp(toggleButton, { key })
		await tick()
		expect(container).toMatchSnapshot()
		expect(props.value).toEqual({ text: 'sun' })
		expect(props.onchange).toHaveBeenCalledWith({ text: 'sun' })

		fireEvent.keyUp(toggleButton, { key })
		await tick()
		expect(container).toMatchSnapshot()
		expect(props.value).toEqual({ text: 'moon' })
		expect(props.onchange).toHaveBeenCalledWith({ text: 'moon' })

		fireEvent.keyUp(toggleButton, { key })
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
		const { container } = render(Toggle, { props })
		const toggleButton = container.querySelector('rk-toggle > button')

		fireEvent.keyUp(toggleButton, { key })
		await tick()
		expect(container).toMatchSnapshot()
		expect(props.value).toEqual({ text: 'earth' })
		expect(props.onchange).toHaveBeenCalledWith({ text: 'earth' })

		fireEvent.keyUp(toggleButton, { key })
		await tick()
		expect(container).toMatchSnapshot()
		expect(props.value).toEqual({ text: 'moon' })
		expect(props.onchange).toHaveBeenCalledWith({ text: 'moon' })

		fireEvent.keyUp(toggleButton, { key })
		await tick()
		expect(container).toMatchSnapshot()
		expect(props.value).toEqual({ text: 'sun' })
		expect(props.onchange).toHaveBeenCalledWith({ text: 'sun' })
	})
})
