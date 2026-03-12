import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent, waitFor } from '@testing-library/svelte'
import Carousel from '../src/components/Carousel.svelte'

describe('Carousel', () => {
	// ─── Rendering ──────────────────────────────────────────────────

	it('renders a carousel container', () => {
		const { container } = render(Carousel, { count: 3 })
		expect(container.querySelector('[data-carousel]')).toBeTruthy()
	})

	it('has role="application" and aria-roledescription', () => {
		const { container } = render(Carousel, { count: 3 })
		const el = container.querySelector('[data-carousel]')
		expect(el?.getAttribute('role')).toBe('application')
		expect(el?.getAttribute('aria-roledescription')).toBe('carousel')
	})

	it('renders viewport and track', () => {
		const { container } = render(Carousel, { count: 3 })
		expect(container.querySelector('[data-carousel-viewport]')).toBeTruthy()
		expect(container.querySelector('[data-carousel-track]')).toBeTruthy()
	})

	// ─── Dots ───────────────────────────────────────────────────────

	it('renders navigation dots', () => {
		const { container } = render(Carousel, { count: 4 })
		const dots = container.querySelectorAll('[data-carousel-dot]')
		expect(dots.length).toBe(4)
	})

	it('first dot is active by default', () => {
		const { container } = render(Carousel, { count: 3 })
		const dots = container.querySelectorAll('[data-carousel-dot]')
		expect(dots[0]?.hasAttribute('data-active')).toBe(true)
		expect(dots[1]?.hasAttribute('data-active')).toBe(false)
	})

	it('dots have role="tab"', () => {
		const { container } = render(Carousel, { count: 3 })
		const dot = container.querySelector('[data-carousel-dot]')
		expect(dot?.getAttribute('role')).toBe('tab')
	})

	it('clicking a dot navigates to that slide', async () => {
		const { container } = render(Carousel, { count: 3 })
		const dots = container.querySelectorAll('[data-carousel-dot]')
		await fireEvent.click(dots[2])
		await waitFor(() => {
			expect(dots[2]?.hasAttribute('data-active')).toBe(true)
			expect(dots[0]?.hasAttribute('data-active')).toBe(false)
		})
	})

	it('hides dots when showDots is false', () => {
		const { container } = render(Carousel, { count: 3, showDots: false })
		expect(container.querySelector('[data-carousel-dots]')).toBeNull()
	})

	it('hides dots when only 1 slide', () => {
		const { container } = render(Carousel, { count: 1 })
		expect(container.querySelector('[data-carousel-dots]')).toBeNull()
	})

	// ─── Arrow Buttons ──────────────────────────────────────────────

	it('renders prev/next arrows', () => {
		const { container } = render(Carousel, { count: 3 })
		expect(container.querySelector('[data-carousel-prev]')).toBeTruthy()
		expect(container.querySelector('[data-carousel-next]')).toBeTruthy()
	})

	it('clicking next advances the slide', async () => {
		const { container } = render(Carousel, { count: 3 })
		const nextBtn = container.querySelector('[data-carousel-next]')!
		await fireEvent.click(nextBtn)
		await waitFor(() => {
			const dots = container.querySelectorAll('[data-carousel-dot]')
			expect(dots[1]?.hasAttribute('data-active')).toBe(true)
		})
	})

	it('clicking prev goes back', async () => {
		const { container } = render(Carousel, { count: 3, current: 2 })
		const prevBtn = container.querySelector('[data-carousel-prev]')!
		await fireEvent.click(prevBtn)
		await waitFor(() => {
			const dots = container.querySelectorAll('[data-carousel-dot]')
			expect(dots[1]?.hasAttribute('data-active')).toBe(true)
		})
	})

	it('hides arrows when showArrows is false', () => {
		const { container } = render(Carousel, { count: 3, showArrows: false })
		expect(container.querySelector('[data-carousel-prev]')).toBeNull()
		expect(container.querySelector('[data-carousel-next]')).toBeNull()
	})

	it('hides arrows when only 1 slide', () => {
		const { container } = render(Carousel, { count: 1 })
		expect(container.querySelector('[data-carousel-prev]')).toBeNull()
		expect(container.querySelector('[data-carousel-next]')).toBeNull()
	})

	// ─── Loop ───────────────────────────────────────────────────────

	it('loops from last to first when loop is true', async () => {
		const { container } = render(Carousel, { count: 3, current: 2, loop: true })
		const nextBtn = container.querySelector('[data-carousel-next]')!
		await fireEvent.click(nextBtn)
		await waitFor(() => {
			const dots = container.querySelectorAll('[data-carousel-dot]')
			expect(dots[0]?.hasAttribute('data-active')).toBe(true)
		})
	})

	it('loops from first to last when loop is true', async () => {
		const { container } = render(Carousel, { count: 3, current: 0, loop: true })
		const prevBtn = container.querySelector('[data-carousel-prev]')!
		await fireEvent.click(prevBtn)
		await waitFor(() => {
			const dots = container.querySelectorAll('[data-carousel-dot]')
			expect(dots[2]?.hasAttribute('data-active')).toBe(true)
		})
	})

	it('disables prev at start when loop is false', () => {
		const { container } = render(Carousel, { count: 3, current: 0, loop: false })
		const prevBtn = container.querySelector('[data-carousel-prev]') as HTMLButtonElement
		expect(prevBtn?.disabled).toBe(true)
	})

	it('disables next at end when loop is false', () => {
		const { container } = render(Carousel, { count: 3, current: 2, loop: false })
		const nextBtn = container.querySelector('[data-carousel-next]') as HTMLButtonElement
		expect(nextBtn?.disabled).toBe(true)
	})

	// ─── Transition ─────────────────────────────────────────────────

	it('defaults to slide transition', () => {
		const { container } = render(Carousel, { count: 3 })
		const el = container.querySelector('[data-carousel]')
		expect(el?.getAttribute('data-carousel-transition')).toBe('slide')
	})

	it('supports fade transition', () => {
		const { container } = render(Carousel, { count: 3, transition: 'fade' })
		const el = container.querySelector('[data-carousel]')
		expect(el?.getAttribute('data-carousel-transition')).toBe('fade')
	})

	it('sets CSS custom properties on track', () => {
		const { container } = render(Carousel, { count: 5, current: 2 })
		const track = container.querySelector('[data-carousel-track]') as HTMLElement
		expect(track.style.getPropertyValue('--carousel-current')).toBe('2')
		expect(track.style.getPropertyValue('--carousel-count')).toBe('5')
	})

	// ─── Custom Class ───────────────────────────────────────────────

	it('applies custom class', () => {
		const { container } = render(Carousel, { count: 3, class: 'my-carousel' })
		const el = container.querySelector('[data-carousel]')
		expect(el?.classList.contains('my-carousel')).toBe(true)
	})

	// ─── Translatable Labels ────────────────────────────────────────

	it('uses default labels from MessagesStore', () => {
		const { container } = render(Carousel, { count: 3 })
		const el = container.querySelector('[data-carousel]')
		expect(el?.getAttribute('aria-label')).toBe('Carousel')
		const prev = container.querySelector('[data-carousel-prev]')
		expect(prev?.getAttribute('aria-label')).toBe('Previous slide')
		const next = container.querySelector('[data-carousel-next]')
		expect(next?.getAttribute('aria-label')).toBe('Next slide')
		const dots = container.querySelector('[data-carousel-dots]')
		expect(dots?.getAttribute('aria-label')).toBe('Slide navigation')
	})

	it('allows custom labels prop to override defaults', () => {
		const { container } = render(Carousel, {
			count: 3,
			labels: { label: 'Diaporama', prev: 'Precedent', next: 'Suivant', slides: 'Navigation' }
		})
		const el = container.querySelector('[data-carousel]')
		expect(el?.getAttribute('aria-label')).toBe('Diaporama')
		expect(container.querySelector('[data-carousel-prev]')?.getAttribute('aria-label')).toBe(
			'Precedent'
		)
		expect(container.querySelector('[data-carousel-next]')?.getAttribute('aria-label')).toBe(
			'Suivant'
		)
		expect(container.querySelector('[data-carousel-dots]')?.getAttribute('aria-label')).toBe(
			'Navigation'
		)
	})
})
