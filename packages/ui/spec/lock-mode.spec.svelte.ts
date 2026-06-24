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

	it('keeps data-mode pinned to the locked value even though root has different mode', () => {
		const { container } = render(LockModeTest, { mode: 'dark' })
		flushSync()
		const el = container.querySelector('[data-mode]')
		// Root has data-mode="light" but the wrapper is locked to "dark"
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
