import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import BadgeTest from './BadgeTest.svelte'
import BadgeStandaloneTest from './BadgeStandaloneTest.svelte'

describe('Badge', () => {
	// ─── Standalone (no children) ─────────────────────────────────────

	it('renders a standalone badge span', () => {
		const { container } = render(BadgeStandaloneTest)
		expect(container.querySelector('[data-badge]')).toBeTruthy()
		expect(container.querySelector('[data-badge]')?.tagName).toBe('SPAN')
	})

	it('renders count text', () => {
		const { container } = render(BadgeStandaloneTest, { props: { count: 5 } })
		expect(container.querySelector('[data-badge]')?.textContent).toBe('5')
	})

	it('renders max+ when count exceeds max', () => {
		const { container } = render(BadgeStandaloneTest, { props: { count: 150, max: 99 } })
		expect(container.querySelector('[data-badge]')?.textContent).toBe('99+')
	})

	it('renders count at max boundary without plus', () => {
		const { container } = render(BadgeStandaloneTest, { props: { count: 99, max: 99 } })
		expect(container.querySelector('[data-badge]')?.textContent).toBe('99')
	})

	it('renders nothing when no count and no dot', () => {
		const { container } = render(BadgeStandaloneTest)
		const badge = container.querySelector('[data-badge]')
		expect(badge?.textContent).toBe('')
	})

	// ─── Dot mode ─────────────────────────────────────────────────────

	it('renders dot attribute when dot=true', () => {
		const { container } = render(BadgeStandaloneTest, { props: { dot: true } })
		const badge = container.querySelector('[data-badge]')
		expect(badge?.hasAttribute('data-dot')).toBe(true)
	})

	it('does not render count text in dot mode', () => {
		const { container } = render(BadgeStandaloneTest, { props: { count: 5, dot: true } })
		expect(container.querySelector('[data-badge]')?.textContent).toBe('')
	})

	it('does not have data-dot when dot=false', () => {
		const { container } = render(BadgeStandaloneTest, { props: { dot: false } })
		expect(container.querySelector('[data-badge]')?.getAttribute('data-dot')).toBeNull()
	})

	// ─── Variant ──────────────────────────────────────────────────────

	it('defaults to variant="default"', () => {
		const { container } = render(BadgeStandaloneTest)
		expect(container.querySelector('[data-badge]')?.getAttribute('data-variant')).toBe('default')
	})

	it('applies variant="primary"', () => {
		const { container } = render(BadgeStandaloneTest, { props: { variant: 'primary' } })
		expect(container.querySelector('[data-badge]')?.getAttribute('data-variant')).toBe('primary')
	})

	it('applies variant="success"', () => {
		const { container } = render(BadgeStandaloneTest, { props: { variant: 'success' } })
		expect(container.querySelector('[data-badge]')?.getAttribute('data-variant')).toBe('success')
	})

	it('applies variant="warning"', () => {
		const { container } = render(BadgeStandaloneTest, { props: { variant: 'warning' } })
		expect(container.querySelector('[data-badge]')?.getAttribute('data-variant')).toBe('warning')
	})

	it('applies variant="error"', () => {
		const { container } = render(BadgeStandaloneTest, { props: { variant: 'error' } })
		expect(container.querySelector('[data-badge]')?.getAttribute('data-variant')).toBe('error')
	})

	// ─── aria-label ──────────────────────────────────────────────────

	it('sets aria-label with count text', () => {
		const { container } = render(BadgeStandaloneTest, { props: { count: 7 } })
		expect(container.querySelector('[data-badge]')?.getAttribute('aria-label')).toBe('7 notifications')
	})

	it('sets aria-label with max+ when count exceeds max', () => {
		const { container } = render(BadgeStandaloneTest, { props: { count: 200, max: 99 } })
		expect(container.querySelector('[data-badge]')?.getAttribute('aria-label')).toBe('99+ notifications')
	})

	it('does not set aria-label in dot mode', () => {
		const { container } = render(BadgeStandaloneTest, { props: { dot: true } })
		expect(container.querySelector('[data-badge]')?.getAttribute('aria-label')).toBeNull()
	})

	it('does not set aria-label when no count', () => {
		const { container } = render(BadgeStandaloneTest)
		expect(container.querySelector('[data-badge]')?.getAttribute('aria-label')).toBeNull()
	})

	// ─── Custom class ─────────────────────────────────────────────────

	it('applies custom CSS class in standalone mode', () => {
		const { container } = render(BadgeStandaloneTest, { props: { class: 'my-badge' } })
		expect(container.querySelector('[data-badge]')?.classList.contains('my-badge')).toBe(true)
	})

	// ─── Wrapper mode (with children) ────────────────────────────────

	it('renders wrapper div when children provided', () => {
		const { container } = render(BadgeTest)
		expect(container.querySelector('[data-badge-wrapper]')).toBeTruthy()
	})

	it('renders badge span inside wrapper', () => {
		const { container } = render(BadgeTest, { props: { count: 3 } })
		const wrapper = container.querySelector('[data-badge-wrapper]')
		expect(wrapper?.querySelector('[data-badge]')).toBeTruthy()
		expect(wrapper?.querySelector('[data-badge]')?.textContent).toBe('3')
	})

	it('renders child content inside wrapper', () => {
		const { container } = render(BadgeTest)
		expect(container.querySelector('[data-badge-child]')).toBeTruthy()
	})

	it('applies custom class to wrapper div', () => {
		const { container } = render(BadgeTest, { props: { class: 'wrap-cls' } })
		expect(container.querySelector('[data-badge-wrapper]')?.classList.contains('wrap-cls')).toBe(true)
	})
})
