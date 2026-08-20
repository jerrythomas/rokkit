import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import Shine from '../src/components/Shine.svelte'

describe('Shine', () => {
	// ─── Rendering ──────────────────────────────────────────────────

	it('renders a shine container', () => {
		const { container } = render(Shine)
		expect(container.querySelector('[data-shine]')).toBeTruthy()
	})

	it('renders an SVG filter element', () => {
		const { container } = render(Shine)
		expect(container.querySelector('[data-shine-filter]')).toBeTruthy()
	})

	it('creates a unique filter ID', () => {
		const { container } = render(Shine)
		const filter = container.querySelector('[data-shine-filter] filter')
		expect(filter?.id).toBeTruthy()
		expect(filter?.id).toContain('filter')
	})

	it('applies filter style to shine container', () => {
		const { container } = render(Shine)
		const el = container.querySelector('[data-shine]') as HTMLElement
		const filter = container.querySelector('[data-shine-filter] filter')
		expect(el.style.filter).toContain(filter?.id as string)
	})

	// ─── SVG Filter Structure ───────────────────────────────────────

	it('has feGaussianBlur', () => {
		const { container } = render(Shine)
		expect(container.querySelector('feGaussianBlur')).toBeTruthy()
	})

	it('has feSpecularLighting', () => {
		const { container } = render(Shine)
		expect(container.querySelector('feSpecularLighting')).toBeTruthy()
	})

	it('has fePointLight', () => {
		const { container } = render(Shine)
		expect(container.querySelector('fePointLight')).toBeTruthy()
	})

	// ─── Props ──────────────────────────────────────────────────────

	it('uses custom depth for blur', () => {
		const { container } = render(Shine, { depth: 3 })
		const blur = container.querySelector('feGaussianBlur')
		expect(blur?.getAttribute('stdDeviation')).toBe('3')
	})

	it('uses custom radius for point light z', () => {
		const { container } = render(Shine, { radius: 500 })
		const light = container.querySelector('fePointLight')
		expect(light?.getAttribute('z')).toBe('500')
	})

	it('uses custom surfaceScale', () => {
		const { container } = render(Shine, { surfaceScale: 5 })
		const spec = container.querySelector('feSpecularLighting')
		expect(spec?.getAttribute('surfaceScale')).toBe('5')
	})

	it('uses custom specularConstant', () => {
		const { container } = render(Shine, { specularConstant: 1.5 })
		const spec = container.querySelector('feSpecularLighting')
		expect(spec?.getAttribute('specularConstant')).toBe('1.5')
	})

	it('uses custom specularExponent', () => {
		const { container } = render(Shine, { specularExponent: 200 })
		const spec = container.querySelector('feSpecularLighting')
		expect(spec?.getAttribute('specularExponent')).toBe('200')
	})

	// ─── Custom Class ───────────────────────────────────────────────

	it('applies custom class', () => {
		const { container } = render(Shine, { class: 'my-shine' })
		const el = container.querySelector('[data-shine]')
		expect(el?.classList.contains('my-shine')).toBe(true)
	})


	// ─── Pointer tracking (window-level handlers drive the light source) ─────────

	const pointLight = (container: Element) => container.querySelector('fePointLight')!

	it('moves the light source to follow the pointer', async () => {
		const { container } = render(Shine)
		expect(pointLight(container).getAttribute('x')).toBe('0')
		await fireEvent.pointerMove(window, { clientX: 120, clientY: 80 })
		expect(pointLight(container).getAttribute('x')).toBe('120')
		expect(pointLight(container).getAttribute('y')).toBe('80')
	})

	it('re-measures the wrapper on scroll without moving the pointer', async () => {
		const { container } = render(Shine)
		await fireEvent.pointerMove(window, { clientX: 40, clientY: 25 })
		await fireEvent.scroll(window)
		// The pointer position is retained; only the wrapper offset is recomputed.
		expect(pointLight(container).getAttribute('x')).toBe('40')
		expect(pointLight(container).getAttribute('y')).toBe('25')
	})

	it('offsets the light by the wrapper position', async () => {
		const { container } = render(Shine)
		const wrapper = container.querySelector('[data-shine]') ?? container.firstElementChild!
		vi.spyOn(wrapper, 'getBoundingClientRect').mockReturnValue({
			left: 10,
			top: 5
		} as DOMRect)
		await fireEvent.pointerMove(window, { clientX: 100, clientY: 50 })
		expect(Number(pointLight(container).getAttribute('x'))).toBeLessThanOrEqual(100)
	})
})
