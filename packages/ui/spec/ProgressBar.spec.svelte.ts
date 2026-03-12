import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import ProgressBar from '../src/components/ProgressBar.svelte'

describe('ProgressBar', () => {
	// ─── Rendering ──────────────────────────────────────────────────

	it('renders a progress container', () => {
		const { container } = render(ProgressBar, { value: 50 })
		expect(container.querySelector('[data-progress]')).toBeTruthy()
	})

	it('has role="progressbar"', () => {
		const { container } = render(ProgressBar, { value: 50 })
		const el = container.querySelector('[data-progress]')
		expect(el?.getAttribute('role')).toBe('progressbar')
	})

	it('renders a progress bar', () => {
		const { container } = render(ProgressBar, { value: 50 })
		expect(container.querySelector('[data-progress-bar]')).toBeTruthy()
	})

	// ─── ARIA ───────────────────────────────────────────────────────

	it('sets aria-valuenow', () => {
		const { container } = render(ProgressBar, { value: 75 })
		const el = container.querySelector('[data-progress]')
		expect(el?.getAttribute('aria-valuenow')).toBe('75')
	})

	it('sets aria-valuemin to 0', () => {
		const { container } = render(ProgressBar, { value: 50 })
		const el = container.querySelector('[data-progress]')
		expect(el?.getAttribute('aria-valuemin')).toBe('0')
	})

	it('sets aria-valuemax', () => {
		const { container } = render(ProgressBar, { value: 50, max: 200 })
		const el = container.querySelector('[data-progress]')
		expect(el?.getAttribute('aria-valuemax')).toBe('200')
	})

	// ─── Width ──────────────────────────────────────────────────────

	it('sets width based on value/max percentage', () => {
		const { container } = render(ProgressBar, { value: 25, max: 100 })
		const bar = container.querySelector('[data-progress-bar]') as HTMLElement
		expect(bar.style.width).toBe('25%')
	})

	it('uses custom max value', () => {
		const { container } = render(ProgressBar, { value: 50, max: 200 })
		const bar = container.querySelector('[data-progress-bar]') as HTMLElement
		expect(bar.style.width).toBe('25%')
	})

	it('clamps percentage to 100%', () => {
		const { container } = render(ProgressBar, { value: 150, max: 100 })
		const bar = container.querySelector('[data-progress-bar]') as HTMLElement
		expect(bar.style.width).toBe('100%')
	})

	it('clamps percentage to 0%', () => {
		const { container } = render(ProgressBar, { value: -10, max: 100 })
		const bar = container.querySelector('[data-progress-bar]') as HTMLElement
		expect(bar.style.width).toBe('0%')
	})

	// ─── Indeterminate ──────────────────────────────────────────────

	it('is indeterminate when value is null', () => {
		const { container } = render(ProgressBar)
		const el = container.querySelector('[data-progress]')
		expect(el?.hasAttribute('data-indeterminate')).toBe(true)
	})

	it('no aria-valuenow when indeterminate', () => {
		const { container } = render(ProgressBar)
		const el = container.querySelector('[data-progress]')
		expect(el?.hasAttribute('aria-valuenow')).toBe(false)
	})

	// ─── Custom Class ───────────────────────────────────────────────

	it('applies custom class', () => {
		const { container } = render(ProgressBar, { value: 50, class: 'my-progress' })
		const el = container.querySelector('[data-progress]')
		expect(el?.classList.contains('my-progress')).toBe(true)
	})
})
