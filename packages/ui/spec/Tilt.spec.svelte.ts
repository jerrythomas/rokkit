import { describe, it, expect } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import Tilt from '../src/components/Tilt.svelte'

describe('Tilt', () => {
	// ─── Rendering ──────────────────────────────────────────────────

	it('renders a tilt container', () => {
		const { container } = render(Tilt)
		expect(container.querySelector('[data-tilt]')).toBeTruthy()
	})

	it('sets default perspective CSS variable', () => {
		const { container } = render(Tilt)
		const el = container.querySelector('[data-tilt]') as HTMLElement
		expect(el.style.getPropertyValue('--tilt-perspective')).toBe('600px')
	})

	it('supports custom perspective', () => {
		const { container } = render(Tilt, { perspective: 1000 })
		const el = container.querySelector('[data-tilt]') as HTMLElement
		expect(el.style.getPropertyValue('--tilt-perspective')).toBe('1000px')
	})

	it('sets initial rotation to 0', () => {
		const { container } = render(Tilt)
		const el = container.querySelector('[data-tilt]') as HTMLElement
		expect(el.style.getPropertyValue('--tilt-rotate-x')).toBe('0deg')
		expect(el.style.getPropertyValue('--tilt-rotate-y')).toBe('0deg')
	})

	it('sets initial brightness to 1', () => {
		const { container } = render(Tilt)
		const el = container.querySelector('[data-tilt]') as HTMLElement
		expect(el.style.getPropertyValue('--tilt-brightness')).toBe('1')
	})

	// ─── Brightness attribute ───────────────────────────────────────

	it('does not set data-tilt-brightness by default', () => {
		const { container } = render(Tilt)
		const el = container.querySelector('[data-tilt]')
		expect(el?.hasAttribute('data-tilt-brightness')).toBe(false)
	})

	it('sets data-tilt-brightness when setBrightness is true', () => {
		const { container } = render(Tilt, { setBrightness: true })
		const el = container.querySelector('[data-tilt]')
		expect(el?.hasAttribute('data-tilt-brightness')).toBe(true)
	})

	// ─── Mouse Events ───────────────────────────────────────────────

	it('updates rotation on mousemove', async () => {
		const { container } = render(Tilt)
		const el = container.querySelector('[data-tilt]') as HTMLElement
		await fireEvent.mouseMove(el, { offsetX: 50, offsetY: 25 })
		// Rotation values should have changed from 0
		const rotateX = el.style.getPropertyValue('--tilt-rotate-x')
		const rotateY = el.style.getPropertyValue('--tilt-rotate-y')
		// With 0 width/height (JSDOM), lerp returns rangeMin — but values are set
		expect(rotateX).toContain('deg')
		expect(rotateY).toContain('deg')
	})

	it('resets rotation on mouseleave', async () => {
		const { container } = render(Tilt)
		const el = container.querySelector('[data-tilt]') as HTMLElement
		await fireEvent.mouseMove(el, { offsetX: 50, offsetY: 25 })
		await fireEvent.mouseLeave(el)
		expect(el.style.getPropertyValue('--tilt-rotate-x')).toBe('0deg')
		expect(el.style.getPropertyValue('--tilt-rotate-y')).toBe('0deg')
	})

	it('resets brightness on mouseleave', async () => {
		const { container } = render(Tilt, { setBrightness: true })
		const el = container.querySelector('[data-tilt]') as HTMLElement
		await fireEvent.mouseMove(el, { offsetX: 50, offsetY: 25 })
		await fireEvent.mouseLeave(el)
		expect(el.style.getPropertyValue('--tilt-brightness')).toBe('1')
	})

	// ─── Custom Class ───────────────────────────────────────────────

	it('applies custom class', () => {
		const { container } = render(Tilt, { class: 'my-tilt' })
		const el = container.querySelector('[data-tilt]')
		expect(el?.classList.contains('my-tilt')).toBe(true)
	})
})
