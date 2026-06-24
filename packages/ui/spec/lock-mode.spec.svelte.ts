import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render } from '@testing-library/svelte'
import { flushSync } from 'svelte'
import LockModeTest from './LockModeTest.svelte'

beforeEach(() => {
	document.documentElement.dataset.style = 'rokkit'
	document.documentElement.dataset.mode = 'light'
})

afterEach(() => {
	delete document.documentElement.dataset.style
	delete document.documentElement.dataset.mode
})

describe('LockMode', () => {
	// ─── data-mode ──────────────────────────────────────────────────

	it('renders with the locked data-mode attribute', () => {
		const { container } = render(LockModeTest, { mode: 'dark' })
		flushSync()
		const el = container.querySelector('[data-mode]')
		expect(el?.getAttribute('data-mode')).toBe('dark')
	})

	it('renders with light mode when specified', () => {
		const { container } = render(LockModeTest, { mode: 'light' })
		flushSync()
		const el = container.querySelector('[data-mode]')
		expect(el?.getAttribute('data-mode')).toBe('light')
	})

	// ─── data-style mirroring ────────────────────────────────────────

	it('mirrors data-style from document root', () => {
		const { container } = render(LockModeTest, { mode: 'dark' })
		flushSync()
		const el = container.querySelector('[data-mode]')
		expect(el?.getAttribute('data-style')).toBe('rokkit')
	})

	it('follows runtime data-style changes on the document root (action wired in)', async () => {
		const { container } = render(LockModeTest, { mode: 'dark' })
		flushSync()
		const el = container.querySelector('[data-mode]')
		expect(el?.getAttribute('data-style')).toBe('rokkit')

		// Change the root style at runtime; the action's MutationObserver mirrors it.
		document.documentElement.dataset.style = 'minimal'
		await new Promise((resolve) => setTimeout(resolve, 0))

		expect(el?.getAttribute('data-style')).toBe('minimal')
		// mode stays pinned to the locked value
		expect(el?.getAttribute('data-mode')).toBe('dark')
	})

	// ─── children ────────────────────────────────────────────────────

	it('renders children inside the wrapper', () => {
		const { container } = render(LockModeTest, { mode: 'dark' })
		flushSync()
		expect(container.querySelector('[data-test-child]')).toBeTruthy()
	})

	// ─── custom class ─────────────────────────────────────────────────

	it('applies custom class', () => {
		const { container } = render(LockModeTest, { mode: 'dark', class: 'my-region' })
		flushSync()
		const el = container.querySelector('[data-mode]')
		expect(el?.classList.contains('my-region')).toBe(true)
	})

	it('does not set class attribute when class prop is empty', () => {
		const { container } = render(LockModeTest, { mode: 'dark' })
		flushSync()
		const el = container.querySelector('[data-mode]')
		expect(el?.hasAttribute('class')).toBe(false)
	})
})
