import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import NavContentTest from './NavContentTest.svelte'

describe('NavContent', () => {
	// ─── Rendering ──────────────────────────────────────────────────

	it('renders a data-nav-content container', () => {
		const { container } = render(NavContentTest)
		expect(container.querySelector('[data-nav-content]')).toBeTruthy()
	})

	it('renders the nav snippet', () => {
		const { container } = render(NavContentTest)
		expect(container.querySelector('[data-test-nav]')).toBeTruthy()
		expect(container.querySelector('[data-test-nav]')?.textContent).toBe('Navigation')
	})

	it('renders the content snippet', () => {
		const { container } = render(NavContentTest)
		expect(container.querySelector('[data-test-content]')).toBeTruthy()
		expect(container.querySelector('[data-test-content]')?.textContent).toBe('Content')
	})

	it('renders nav pane container', () => {
		const { container } = render(NavContentTest)
		expect(container.querySelector('[data-nav-content-nav]')).toBeTruthy()
	})

	it('renders main pane container', () => {
		const { container } = render(NavContentTest)
		expect(container.querySelector('[data-nav-content-main]')).toBeTruthy()
	})

	// ─── Orientation ─────────────────────────────────────────────────

	it('defaults to orientation="horizontal"', () => {
		const { container } = render(NavContentTest)
		const el = container.querySelector('[data-nav-content]')
		expect(el?.getAttribute('data-orientation')).toBe('horizontal')
	})

	it('applies orientation="vertical"', () => {
		const { container } = render(NavContentTest, { props: { orientation: 'vertical' } })
		const el = container.querySelector('[data-nav-content]')
		expect(el?.getAttribute('data-orientation')).toBe('vertical')
	})

	// ─── Collapsible ─────────────────────────────────────────────────

	it('defaults to collapsible=true and sets data-collapsible', () => {
		const { container } = render(NavContentTest)
		const el = container.querySelector('[data-nav-content]')
		expect(el?.hasAttribute('data-collapsible')).toBe(true)
	})

	it('does not set data-collapsible when collapsible=false', () => {
		const { container } = render(NavContentTest, { props: { collapsible: false } })
		const el = container.querySelector('[data-nav-content]')
		expect(el?.getAttribute('data-collapsible')).toBeNull()
	})

	// ─── Nav size ─────────────────────────────────────────────────────

	it('sets --nav-size CSS custom property with default', () => {
		const { container } = render(NavContentTest)
		const el = container.querySelector('[data-nav-content]') as HTMLElement
		expect(el.style.getPropertyValue('--nav-size')).toBe('280px')
	})

	it('sets --nav-size with custom value', () => {
		const { container } = render(NavContentTest, { props: { navSize: '320px' } })
		const el = container.querySelector('[data-nav-content]') as HTMLElement
		expect(el.style.getPropertyValue('--nav-size')).toBe('320px')
	})

	// ─── Custom class ─────────────────────────────────────────────────

	it('applies custom CSS class', () => {
		const { container } = render(NavContentTest, { props: { class: 'my-layout' } })
		expect(container.querySelector('[data-nav-content]')?.classList.contains('my-layout')).toBe(true)
	})

	it('does not add class attribute when className is empty', () => {
		const { container } = render(NavContentTest)
		expect(container.querySelector('[data-nav-content]')?.getAttribute('class')).toBeNull()
	})
})
