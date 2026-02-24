import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import Range from '../src/components/Range.svelte'

describe('Range', () => {
	// ─── Rendering ──────────────────────────────────────────────────

	it('renders a range container', () => {
		const { container } = render(Range)
		expect(container.querySelector('[data-range]')).toBeTruthy()
	})

	it('renders a track', () => {
		const { container } = render(Range)
		expect(container.querySelector('[data-range-track]')).toBeTruthy()
	})

	it('renders a track bar', () => {
		const { container } = render(Range)
		expect(container.querySelector('[data-range-bar]')).toBeTruthy()
	})

	it('renders a selected range', () => {
		const { container } = render(Range)
		expect(container.querySelector('[data-range-selected]')).toBeTruthy()
	})

	it('renders a single thumb by default', () => {
		const { container } = render(Range)
		const thumbs = container.querySelectorAll('[data-range-thumb]')
		expect(thumbs.length).toBe(1)
		expect(thumbs[0].getAttribute('data-thumb')).toBe('value')
	})

	// ─── Range mode ─────────────────────────────────────────────────

	it('renders two thumbs in range mode', () => {
		const { container } = render(Range, { range: true, lower: 20, upper: 80 })
		const thumbs = container.querySelectorAll('[data-range-thumb]')
		expect(thumbs.length).toBe(2)
		expect(thumbs[0].getAttribute('data-thumb')).toBe('lower')
		expect(thumbs[1].getAttribute('data-thumb')).toBe('upper')
	})

	// ─── Disabled state ─────────────────────────────────────────────

	it('applies disabled attribute', () => {
		const { container } = render(Range, { disabled: true })
		expect(container.querySelector('[data-range]')?.hasAttribute('data-disabled')).toBe(true)
	})

	it('sets tabindex -1 on thumb when disabled', () => {
		const { container } = render(Range, { disabled: true })
		const thumb = container.querySelector('[data-range-thumb]')
		expect(thumb?.getAttribute('tabindex')).toBe('-1')
	})

	// ─── ARIA ───────────────────────────────────────────────────────

	it('has role=slider on thumb', () => {
		const { container } = render(Range)
		const thumb = container.querySelector('[data-range-thumb]')
		expect(thumb?.getAttribute('role')).toBe('slider')
	})

	it('has correct aria-valuenow on single thumb', () => {
		const { container } = render(Range, { value: 30, min: 0, max: 100 })
		const thumb = container.querySelector('[data-range-thumb]')
		expect(thumb?.getAttribute('aria-valuenow')).toBe('30')
	})

	it('has correct aria-valuemin/max on single thumb', () => {
		const { container } = render(Range, { value: 50, min: 10, max: 90 })
		const thumb = container.querySelector('[data-range-thumb]')
		expect(thumb?.getAttribute('aria-valuemin')).toBe('10')
		expect(thumb?.getAttribute('aria-valuemax')).toBe('90')
	})

	it('has correct aria values in range mode', () => {
		const { container } = render(Range, { range: true, lower: 25, upper: 75, min: 0, max: 100 })
		const thumbs = container.querySelectorAll('[data-range-thumb]')
		// Lower thumb
		expect(thumbs[0].getAttribute('aria-valuenow')).toBe('25')
		expect(thumbs[0].getAttribute('aria-valuemin')).toBe('0')
		expect(thumbs[0].getAttribute('aria-valuemax')).toBe('75')
		// Upper thumb
		expect(thumbs[1].getAttribute('aria-valuenow')).toBe('75')
		expect(thumbs[1].getAttribute('aria-valuemin')).toBe('25')
		expect(thumbs[1].getAttribute('aria-valuemax')).toBe('100')
	})

	it('has aria-label on thumbs', () => {
		const { container } = render(Range, { range: true, lower: 20, upper: 80 })
		const thumbs = container.querySelectorAll('[data-range-thumb]')
		expect(thumbs[0].getAttribute('aria-label')).toBe('Lower bound')
		expect(thumbs[1].getAttribute('aria-label')).toBe('Upper bound')
	})

	it('has aria-label "Value" in single mode', () => {
		const { container } = render(Range)
		const thumb = container.querySelector('[data-range-thumb]')
		expect(thumb?.getAttribute('aria-label')).toBe('Value')
	})

	// ─── Ticks ──────────────────────────────────────────────────────

	it('does not render ticks by default', () => {
		const { container } = render(Range)
		expect(container.querySelector('[data-range-ticks]')).toBeNull()
	})

	it('renders ticks when ticks > 0', () => {
		const { container } = render(Range, { ticks: 5, min: 0, max: 100 })
		const ticks = container.querySelectorAll('[data-range-tick]')
		expect(ticks.length).toBeGreaterThan(0)
	})

	it('renders tick bars', () => {
		const { container } = render(Range, { ticks: 5, min: 0, max: 100 })
		const tickBars = container.querySelectorAll('[data-tick-bar]')
		expect(tickBars.length).toBeGreaterThan(0)
	})

	it('renders tick labels', () => {
		const { container } = render(Range, { ticks: 5, min: 0, max: 100 })
		const tickLabels = container.querySelectorAll('[data-tick-label]')
		expect(tickLabels.length).toBeGreaterThan(0)
	})

	// ─── Keyboard ───────────────────────────────────────────────────

	it('increments value on ArrowRight', async () => {
		const onchange = vi.fn()
		const { container } = render(Range, { value: 50, step: 10, onchange })
		const thumb = container.querySelector('[data-range-thumb]')!
		await fireEvent.keyDown(thumb, { key: 'ArrowRight' })
		expect(onchange).toHaveBeenCalledWith(60)
	})

	it('decrements value on ArrowLeft', async () => {
		const onchange = vi.fn()
		const { container } = render(Range, { value: 50, step: 10, onchange })
		const thumb = container.querySelector('[data-range-thumb]')!
		await fireEvent.keyDown(thumb, { key: 'ArrowLeft' })
		expect(onchange).toHaveBeenCalledWith(40)
	})

	it('does not go below min on ArrowLeft', async () => {
		const onchange = vi.fn()
		const { container } = render(Range, { value: 0, min: 0, step: 10, onchange })
		const thumb = container.querySelector('[data-range-thumb]')!
		await fireEvent.keyDown(thumb, { key: 'ArrowLeft' })
		expect(onchange).toHaveBeenCalledWith(0)
	})

	it('does not go above max on ArrowRight', async () => {
		const onchange = vi.fn()
		const { container } = render(Range, { value: 100, max: 100, step: 10, onchange })
		const thumb = container.querySelector('[data-range-thumb]')!
		await fireEvent.keyDown(thumb, { key: 'ArrowRight' })
		expect(onchange).toHaveBeenCalledWith(100)
	})

	it('jumps to min on Home', async () => {
		const onchange = vi.fn()
		const { container } = render(Range, { value: 50, min: 0, onchange })
		const thumb = container.querySelector('[data-range-thumb]')!
		await fireEvent.keyDown(thumb, { key: 'Home' })
		expect(onchange).toHaveBeenCalledWith(0)
	})

	it('jumps to max on End', async () => {
		const onchange = vi.fn()
		const { container } = render(Range, { value: 50, max: 100, onchange })
		const thumb = container.querySelector('[data-range-thumb]')!
		await fireEvent.keyDown(thumb, { key: 'End' })
		expect(onchange).toHaveBeenCalledWith(100)
	})

	it('does not respond to keyboard when disabled', async () => {
		const onchange = vi.fn()
		const { container } = render(Range, { value: 50, step: 10, disabled: true, onchange })
		const thumb = container.querySelector('[data-range-thumb]')!
		await fireEvent.keyDown(thumb, { key: 'ArrowRight' })
		expect(onchange).not.toHaveBeenCalled()
	})

	// ─── Range mode keyboard ────────────────────────────────────────

	it('increments upper on ArrowRight in range mode', async () => {
		const onchange = vi.fn()
		const { container } = render(Range, { range: true, lower: 20, upper: 50, step: 10, onchange })
		const upperThumb = container.querySelectorAll('[data-range-thumb]')[1]
		await fireEvent.keyDown(upperThumb, { key: 'ArrowRight' })
		expect(onchange).toHaveBeenCalledWith([20, 60])
	})

	it('decrements lower on ArrowLeft in range mode', async () => {
		const onchange = vi.fn()
		const { container } = render(Range, { range: true, lower: 30, upper: 70, step: 10, onchange })
		const lowerThumb = container.querySelectorAll('[data-range-thumb]')[0]
		await fireEvent.keyDown(lowerThumb, { key: 'ArrowLeft' })
		expect(onchange).toHaveBeenCalledWith([20, 70])
	})

	// ─── CSS class ──────────────────────────────────────────────────

	it('applies custom CSS class', () => {
		const { container } = render(Range, { class: 'my-range' })
		expect(container.querySelector('[data-range]')?.classList.contains('my-range')).toBe(true)
	})

	// ─── Selected range positioning ─────────────────────────────────

	it('positions selected range from 0 to value percent in single mode', () => {
		const { container } = render(Range, { value: 50, min: 0, max: 100 })
		const selected = container.querySelector('[data-range-selected]') as HTMLElement
		expect(selected.style.left).toBe('0%')
		expect(selected.style.width).toBe('50%')
	})

	it('positions selected range between lower and upper in range mode', () => {
		const { container } = render(Range, { range: true, lower: 25, upper: 75, min: 0, max: 100 })
		const selected = container.querySelector('[data-range-selected]') as HTMLElement
		expect(selected.style.left).toBe('25%')
		expect(selected.style.width).toBe('50%')
	})

	// ─── Thumb positioning ──────────────────────────────────────────

	it('positions thumb at correct percentage', () => {
		const { container } = render(Range, { value: 75, min: 0, max: 100 })
		const thumb = container.querySelector('[data-range-thumb]') as HTMLElement
		expect(thumb.style.left).toBe('75%')
	})
})
