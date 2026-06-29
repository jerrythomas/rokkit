import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import Avatar from '../src/components/Avatar.svelte'

describe('Avatar', () => {
	// ─── Rendering ──────────────────────────────────────────────────

	it('renders a data-avatar container', () => {
		const { container } = render(Avatar)
		expect(container.querySelector('[data-avatar]')).toBeTruthy()
	})

	it('has role="img"', () => {
		const { container } = render(Avatar)
		const el = container.querySelector('[data-avatar]')
		expect(el?.getAttribute('role')).toBe('img')
	})

	// ─── Image mode ──────────────────────────────────────────────────

	it('renders img element when src is provided', () => {
		const { container } = render(Avatar, { src: 'https://example.com/a.png', alt: 'Test' })
		expect(container.querySelector('[data-avatar-img]')).toBeTruthy()
	})

	it('does not render initials when src is provided', () => {
		const { container } = render(Avatar, { src: 'https://example.com/a.png', alt: 'Test' })
		expect(container.querySelector('[data-avatar-initials]')).toBeNull()
	})

	// ─── Initials fallback ────────────────────────────────────────────

	it('renders initials when no src is provided', () => {
		const { container } = render(Avatar, { name: 'Alice Bob' })
		const initials = container.querySelector('[data-avatar-initials]')
		expect(initials).toBeTruthy()
		expect(initials?.textContent).toBe('AB')
	})

	it('renders single letter initials for single-word name', () => {
		const { container } = render(Avatar, { name: 'Alice' })
		const initials = container.querySelector('[data-avatar-initials]')
		expect(initials?.textContent).toBe('A')
	})

	it('renders "?" when neither src nor name is provided', () => {
		const { container } = render(Avatar)
		const initials = container.querySelector('[data-avatar-initials]')
		expect(initials?.textContent).toBe('?')
	})

	it('uses explicit initials prop over name derivation', () => {
		const { container } = render(Avatar, { name: 'Alice Bob', initials: 'XY' })
		const initials = container.querySelector('[data-avatar-initials]')
		expect(initials?.textContent).toBe('XY')
	})

	// ─── Image error fallback ─────────────────────────────────────────

	it('falls back to initials when image fails to load', async () => {
		const { container } = render(Avatar, { src: 'bad-url.png', name: 'Error User' })
		const img = container.querySelector('[data-avatar-img]') as HTMLImageElement
		expect(img).toBeTruthy()
		await fireEvent.error(img)
		expect(container.querySelector('[data-avatar-initials]')).toBeTruthy()
		expect(container.querySelector('[data-avatar-img]')).toBeNull()
	})

	// ─── Alt text ─────────────────────────────────────────────────────

	it('uses alt prop for aria-label', () => {
		const { container } = render(Avatar, { src: 'x.png', alt: 'Profile pic' })
		expect(container.querySelector('[data-avatar]')?.getAttribute('aria-label')).toBe('Profile pic')
	})

	it('uses name as aria-label when alt is not provided', () => {
		const { container } = render(Avatar, { name: 'Alice Bob' })
		expect(container.querySelector('[data-avatar]')?.getAttribute('aria-label')).toBe('Alice Bob')
	})

	it('defaults aria-label to "Avatar" when neither alt nor name', () => {
		const { container } = render(Avatar)
		expect(container.querySelector('[data-avatar]')?.getAttribute('aria-label')).toBe('Avatar')
	})

	// ─── Size ─────────────────────────────────────────────────────────

	it('defaults to size="md"', () => {
		const { container } = render(Avatar)
		expect(container.querySelector('[data-avatar]')?.getAttribute('data-size')).toBe('md')
	})

	it('applies size="sm"', () => {
		const { container } = render(Avatar, { size: 'sm' })
		expect(container.querySelector('[data-avatar]')?.getAttribute('data-size')).toBe('sm')
	})

	it('applies size="lg"', () => {
		const { container } = render(Avatar, { size: 'lg' })
		expect(container.querySelector('[data-avatar]')?.getAttribute('data-size')).toBe('lg')
	})

	// ─── Shape ────────────────────────────────────────────────────────

	it('defaults to shape="circle"', () => {
		const { container } = render(Avatar)
		expect(container.querySelector('[data-avatar]')?.getAttribute('data-shape')).toBe('circle')
	})

	it('applies shape="square"', () => {
		const { container } = render(Avatar, { shape: 'square' })
		expect(container.querySelector('[data-avatar]')?.getAttribute('data-shape')).toBe('square')
	})

	// ─── Status ───────────────────────────────────────────────────────

	it('renders status indicator when status is set', () => {
		const { container } = render(Avatar, { status: 'online' })
		const statusEl = container.querySelector('[data-avatar-status]')
		expect(statusEl).toBeTruthy()
		expect(statusEl?.getAttribute('data-status')).toBe('online')
		expect(statusEl?.getAttribute('aria-label')).toBe('online')
	})

	it('does not render status indicator when status is undefined', () => {
		const { container } = render(Avatar)
		expect(container.querySelector('[data-avatar-status]')).toBeNull()
	})

	it('does not set data-status on container when no status', () => {
		const { container } = render(Avatar)
		expect(container.querySelector('[data-avatar]')?.getAttribute('data-status')).toBeNull()
	})

	// ─── Custom class ─────────────────────────────────────────────────

	it('applies custom CSS class', () => {
		const { container } = render(Avatar, { class: 'my-avatar' })
		const el = container.querySelector('[data-avatar]')
		expect(el?.classList.contains('my-avatar')).toBe(true)
	})

	it('does not add class attribute when className is empty', () => {
		const { container } = render(Avatar)
		expect(container.querySelector('[data-avatar]')?.getAttribute('class')).toBeNull()
	})
})
