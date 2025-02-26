import { describe, expect, it, beforeEach } from 'vitest'
import { cleanup, render, fireEvent } from '@testing-library/svelte'
import RangeSlider from '../src/RangeSlider.svelte'
import { scaleLinear } from 'd3-scale'

describe('RangeSlider', () => {
	const scale = scaleLinear().domain([0, 200]).range([0, 100])
	const steps = [0, 25, 50, 75, 100]

	beforeEach(() => {
		cleanup()
	})

	it('should render correctly', () => {
		const props = $state({ min: 0, max: 100, cx: 50, steps, scale, value: 0 })
		const { container } = render(RangeSlider, { props })
		expect(container).toMatchSnapshot()
	})

	it('should handle mouse move', () => {
		const props = $state({ min: 0, max: 100, cx: 0, steps, scale, value: 0 })
		const { container } = render(RangeSlider, { props })
		expect(container).toMatchSnapshot()
		const thumb = container.querySelector('rk-thumb')
		fireEvent.mouseDown(thumb, { clientX: 0, clientY: 0 })
		fireEvent.mouseMove(window, { clientX: 55, clientY: 0 })
		fireEvent.mouseUp(window, { clientX: 55, clientY: 0 })

		expect(props.value).toBe(25)

		fireEvent.mouseDown(thumb, { clientX: 50, clientY: 0 })
		fireEvent.mouseMove(window, { clientX: 140, clientY: 0 })
		fireEvent.mouseUp(window, { clientX: 140, clientY: 0 })

		expect(props.value).toBe(75)

		fireEvent.mouseDown(thumb, { clientX: 130, clientY: 0 })
		fireEvent.mouseMove(window, { clientX: -10, clientY: 0 })
		fireEvent.mouseUp(window, { clientX: -10, clientY: 0 })

		expect(props.value).toBe(0)
		fireEvent.mouseDown(thumb, { clientX: 0, clientY: 0 })
		fireEvent.mouseMove(window, { clientX: 0, clientY: 0 })
		fireEvent.mouseUp(window, { clientX: 0, clientY: 0 })
		expect(props.value).toBe(0)
	})

	it('should handle keyboard movement', () => {
		const props = $state({ min: 0, max: 100, cx: 0, steps, scale, value: 0 })
		const { container } = render(RangeSlider, { props })
		expect(container).toMatchSnapshot()
		const thumb = container.querySelector('rk-thumb')

		fireEvent.keyDown(thumb, { key: 'ArrowRight' })
		expect(props.value).toBe(25)
		fireEvent.keyDown(thumb, { key: 'ArrowRight' })
		expect(props.value).toBe(50)
		fireEvent.keyDown(thumb, { key: 'ArrowRight' })
		expect(props.value).toBe(75)
		fireEvent.keyDown(thumb, { key: 'ArrowLeft' })
		expect(props.value).toBe(50)
		fireEvent.keyDown(thumb, { key: 'ArrowLeft' })
		expect(props.value).toBe(25)
		fireEvent.keyDown(thumb, { key: 'ArrowLeft' })
		expect(props.value).toBe(0)
		fireEvent.keyDown(thumb, { key: 'X' })
		expect(props.value).toBe(0)
	})

	it('should handle mouse move without steps', () => {
		const props = $state({ min: 0, max: 100, cx: 0, steps: [], scale, value: 0 })
		const { container } = render(RangeSlider, { props })
		expect(container).toMatchSnapshot()
		const thumb = container.querySelector('rk-thumb')
		fireEvent.mouseDown(thumb, { clientX: 0, clientY: 0 })
		fireEvent.mouseMove(window, { clientX: 60, clientY: 0 })
		fireEvent.mouseUp(window, { clientX: 60, clientY: 0 })

		expect(props.value).toBe(30)

		fireEvent.mouseDown(thumb, { clientX: 60, clientY: 0 })
		fireEvent.mouseMove(window, { clientX: 130, clientY: 0 })
		fireEvent.mouseUp(window, { clientX: 130, clientY: 0 })

		expect(props.value).toBe(65)

		fireEvent.mouseDown(thumb, { clientX: 130, clientY: 0 })
		fireEvent.mouseMove(window, { clientX: -10, clientY: 0 })
		fireEvent.mouseUp(window, { clientX: -10, clientY: 0 })

		expect(props.value).toBe(0)
	})

	it('should handle keyboard movement without steps', () => {
		const props = $state({ min: 0, max: 100, cx: 0, steps: [], scale, value: 0 })
		const { container } = render(RangeSlider, { props })
		expect(container).toMatchSnapshot()
		const thumb = container.querySelector('rk-thumb')

		fireEvent.keyDown(thumb, { key: 'ArrowRight' })
		expect(props.value).toBe(10)
		fireEvent.keyDown(thumb, { key: 'ArrowRight' })
		expect(props.value).toBe(20)
		fireEvent.keyDown(thumb, { key: 'ArrowRight' })
		expect(props.value).toBe(30)
		fireEvent.keyDown(thumb, { key: 'ArrowLeft' })
		expect(props.value).toBe(20)
		fireEvent.keyDown(thumb, { key: 'ArrowLeft' })
		expect(props.value).toBe(10)
		fireEvent.keyDown(thumb, { key: 'ArrowLeft' })
		expect(props.value).toBe(0)
		fireEvent.keyDown(thumb, { key: 'X' })
		expect(props.value).toBe(0)
	})
})
