import { describe, it, expect, beforeEach, vi } from 'vitest'
import { cleanup, render, fireEvent } from '@testing-library/svelte'
import { flushSync } from 'svelte'
import Input from '../src/Input.svelte'

/**
 * `src/Input.svelte` is the renderer dispatcher: it resolves a component by type
 * and decides whether to wrap it in the `data-input-root` shell. Checkbox and
 * swatch deliberately render BARE — the shell adds padding and an icon slot that
 * would misalign a bare control — and that branch had no test.
 */

beforeEach(() => cleanup())

describe('Input — renderer shell', () => {
	it('wraps a normal input in the data-input-root shell', () => {
		const props = $state({ type: 'text', value: 'hello' })
		const { container } = render(Input, { props })

		expect(container.querySelector('[data-input-root]')).toBeTruthy()
		expect(container.querySelector('input')).toBeTruthy()
	})

	it('renders a checkbox bare, with no shell', () => {
		const props = $state({ type: 'checkbox', value: true })
		const { container } = render(Input, { props })

		expect(container.querySelector('[data-input-root]')).toBeNull()
		expect(container.querySelector('input[type="checkbox"]')).toBeTruthy()
	})

	it('renders a swatch bare, with no shell', () => {
		const props = $state({ type: 'swatch', value: '#ff0000' })
		const { container } = render(Input, { props })

		expect(container.querySelector('[data-input-root]')).toBeNull()
	})
})

describe('Input — icon slot', () => {
	it('renders the icon inside the shell when one is supplied', () => {
		const props = $state({ type: 'text', value: '', icon: 'i-mdi-magnify' })
		const { container } = render(Input, { props })

		const icon = container.querySelector('[data-input-icon]')
		expect(icon).toBeTruthy()
		expect(icon.classList.contains('i-mdi-magnify')).toBe(true)
		// Decorative only — it must not be announced.
		expect(icon.getAttribute('aria-hidden')).toBe('true')
	})

	it('omits the icon element entirely when none is supplied', () => {
		const props = $state({ type: 'text', value: '' })
		const { container } = render(Input, { props })

		expect(container.querySelector('[data-input-icon]')).toBeNull()
	})

	it('does not render an icon for the bare checkbox variant', () => {
		const props = $state({ type: 'checkbox', value: false, icon: 'i-mdi-check' })
		const { container } = render(Input, { props })

		expect(container.querySelector('[data-input-icon]')).toBeNull()
	})
})

describe('Input — integer step', () => {
	it('adds step="1" for the integer type', () => {
		const props = $state({ type: 'integer', value: 3 })
		const { container } = render(Input, { props })

		expect(container.querySelector('input')?.getAttribute('step')).toBe('1')
	})

	it('leaves step unset for a plain number', () => {
		const props = $state({ type: 'number', value: 3 })
		const { container } = render(Input, { props })

		expect(container.querySelector('input')?.getAttribute('step')).toBeNull()
	})
})

describe('Input — event forwarding', () => {
	it('forwards onchange from the resolved renderer', async () => {
		const onchange = vi.fn()
		const props = $state({ type: 'text', value: '', onchange })
		const { container } = render(Input, { props })

		const input = container.querySelector('input')
		input.value = 'typed'
		await fireEvent.change(input)
		flushSync()

		expect(onchange).toHaveBeenCalled()
	})
})
