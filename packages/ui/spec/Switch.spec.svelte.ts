import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import Switch from '../src/components/Switch.svelte'

const textOptions: [object, object] = [
	{ label: 'Off', value: 'off' },
	{ label: 'On', value: 'on' }
]

const iconOptions: [object, object] = [
	{ label: 'Dark', value: 0, icon: 'i-lucide:moon' },
	{ label: 'Light', value: 1, icon: 'i-lucide:sun' }
]

describe('Switch', () => {
	// ─── Rendering ──────────────────────────────────────────────────

	it('renders a button with role="switch"', () => {
		const { container } = render(Switch)
		const el = container.querySelector('[data-switch]')
		expect(el).toBeTruthy()
		expect(el?.getAttribute('role')).toBe('switch')
		expect(el?.tagName).toBe('BUTTON')
	})

	it('renders track and thumb elements', () => {
		const { container } = render(Switch)
		expect(container.querySelector('[data-switch-track]')).toBeTruthy()
		expect(container.querySelector('[data-switch-thumb]')).toBeTruthy()
	})

	it('defaults to aria-checked=false with default [false, true] options', () => {
		const { container } = render(Switch)
		const el = container.querySelector('[data-switch]')
		expect(el?.getAttribute('aria-checked')).toBe('false')
	})

	// ─── Selection State ────────────────────────────────────────────

	it('aria-checked is true when value matches second option', () => {
		const { container } = render(Switch, { options: textOptions, value: 'on' })
		const el = container.querySelector('[data-switch]')
		expect(el?.getAttribute('aria-checked')).toBe('true')
	})

	it('aria-checked is false when value matches first option', () => {
		const { container } = render(Switch, { options: textOptions, value: 'off' })
		const el = container.querySelector('[data-switch]')
		expect(el?.getAttribute('aria-checked')).toBe('false')
	})

	// ─── Click Interaction ──────────────────────────────────────────

	it('clicking toggles from off to on', async () => {
		const onchange = vi.fn()
		const { container } = render(Switch, { options: textOptions, value: 'off', onchange })
		const el = container.querySelector('[data-switch]')!
		await fireEvent.click(el)
		expect(onchange).toHaveBeenCalledWith('on', textOptions[1])
	})

	it('clicking toggles from on to off', async () => {
		const onchange = vi.fn()
		const { container } = render(Switch, { options: textOptions, value: 'on', onchange })
		const el = container.querySelector('[data-switch]')!
		await fireEvent.click(el)
		expect(onchange).toHaveBeenCalledWith('off', textOptions[0])
	})

	it('works with default boolean options', async () => {
		const onchange = vi.fn()
		const { container } = render(Switch, { value: false, onchange })
		const el = container.querySelector('[data-switch]')!
		await fireEvent.click(el)
		expect(onchange).toHaveBeenCalledWith(true, true)
	})

	// ─── Keyboard ───────────────────────────────────────────────────

	it('Space toggles the switch', async () => {
		const onchange = vi.fn()
		const { container } = render(Switch, { options: textOptions, value: 'off', onchange })
		const el = container.querySelector('[data-switch]')!
		await fireEvent.keyDown(el, { key: ' ' })
		expect(onchange).toHaveBeenCalledWith('on', textOptions[1])
	})

	it('Enter toggles the switch', async () => {
		const onchange = vi.fn()
		const { container } = render(Switch, { options: textOptions, value: 'off', onchange })
		const el = container.querySelector('[data-switch]')!
		await fireEvent.keyDown(el, { key: 'Enter' })
		expect(onchange).toHaveBeenCalledWith('on', textOptions[1])
	})

	it('ArrowRight moves to on when currently off', async () => {
		const onchange = vi.fn()
		const { container } = render(Switch, { options: textOptions, value: 'off', onchange })
		const el = container.querySelector('[data-switch]')!
		await fireEvent.keyDown(el, { key: 'ArrowRight' })
		expect(onchange).toHaveBeenCalledWith('on', textOptions[1])
	})

	it('ArrowRight does nothing when already on', async () => {
		const onchange = vi.fn()
		const { container } = render(Switch, { options: textOptions, value: 'on', onchange })
		const el = container.querySelector('[data-switch]')!
		await fireEvent.keyDown(el, { key: 'ArrowRight' })
		expect(onchange).not.toHaveBeenCalled()
	})

	it('ArrowLeft moves to off when currently on', async () => {
		const onchange = vi.fn()
		const { container } = render(Switch, { options: textOptions, value: 'on', onchange })
		const el = container.querySelector('[data-switch]')!
		await fireEvent.keyDown(el, { key: 'ArrowLeft' })
		expect(onchange).toHaveBeenCalledWith('off', textOptions[0])
	})

	it('ArrowLeft does nothing when already off', async () => {
		const onchange = vi.fn()
		const { container } = render(Switch, { options: textOptions, value: 'off', onchange })
		const el = container.querySelector('[data-switch]')!
		await fireEvent.keyDown(el, { key: 'ArrowLeft' })
		expect(onchange).not.toHaveBeenCalled()
	})

	// ─── Disabled ───────────────────────────────────────────────────

	it('is disabled when disabled prop is true', () => {
		const { container } = render(Switch, { disabled: true })
		const el = container.querySelector('[data-switch]') as HTMLButtonElement
		expect(el?.disabled).toBe(true)
		expect(el?.hasAttribute('data-switch-disabled')).toBe(true)
	})

	it('does not call onchange when disabled', async () => {
		const onchange = vi.fn()
		const { container } = render(Switch, {
			options: textOptions,
			value: 'off',
			disabled: true,
			onchange
		})
		const el = container.querySelector('[data-switch]')!
		await fireEvent.click(el)
		expect(onchange).not.toHaveBeenCalled()
	})

	it('does not toggle on keyboard when disabled', async () => {
		const onchange = vi.fn()
		const { container } = render(Switch, {
			options: textOptions,
			value: 'off',
			disabled: true,
			onchange
		})
		const el = container.querySelector('[data-switch]')!
		await fireEvent.keyDown(el, { key: ' ' })
		expect(onchange).not.toHaveBeenCalled()
	})

	// ─── Size Variants ──────────────────────────────────────────────

	it('renders with default md size', () => {
		const { container } = render(Switch)
		const el = container.querySelector('[data-switch]')
		expect(el?.getAttribute('data-switch-size')).toBe('md')
	})

	it('renders with sm size', () => {
		const { container } = render(Switch, { size: 'sm' })
		const el = container.querySelector('[data-switch]')
		expect(el?.getAttribute('data-switch-size')).toBe('sm')
	})

	it('renders with lg size', () => {
		const { container } = render(Switch, { size: 'lg' })
		const el = container.querySelector('[data-switch]')
		expect(el?.getAttribute('data-switch-size')).toBe('lg')
	})

	// ─── Labels ─────────────────────────────────────────────────────

	it('does not show labels by default', () => {
		const { container } = render(Switch, { options: textOptions })
		expect(container.querySelector('[data-switch-label]')).toBeNull()
	})

	it('shows label when showLabels is true', () => {
		const { container } = render(Switch, {
			options: textOptions,
			value: 'off',
			showLabels: true
		})
		const label = container.querySelector('[data-switch-label]')
		expect(label).toBeTruthy()
		expect(label?.textContent).toBe('Off')
	})

	it('shows on-state label when checked', () => {
		const { container } = render(Switch, {
			options: textOptions,
			value: 'on',
			showLabels: true
		})
		const label = container.querySelector('[data-switch-label]')
		expect(label?.textContent).toBe('On')
	})

	// ─── Icons ──────────────────────────────────────────────────────

	it('renders icon in thumb when option has icon', () => {
		const { container } = render(Switch, { options: iconOptions, value: 1 })
		const icon = container.querySelector('[data-switch-icon]')
		expect(icon).toBeTruthy()
		expect(icon?.classList.contains('i-lucide:sun')).toBe(true)
	})

	it('renders off-state icon when unchecked', () => {
		const { container } = render(Switch, { options: iconOptions, value: 0 })
		const icon = container.querySelector('[data-switch-icon]')
		expect(icon).toBeTruthy()
		expect(icon?.classList.contains('i-lucide:moon')).toBe(true)
	})

	// ─── Custom Field Mapping ───────────────────────────────────────

	it('supports custom field mapping', async () => {
		const opts: [object, object] = [
			{ label: 'Disabled', id: 0 },
			{ label: 'Enabled', id: 1 }
		]
		const onchange = vi.fn()
		const { container } = render(Switch, {
			options: opts,
			fields: { label: 'label', value: 'id' },
			value: 0,
			onchange
		})
		const el = container.querySelector('[data-switch]')!
		await fireEvent.click(el)
		expect(onchange).toHaveBeenCalledWith(1, opts[1])
	})

	// ─── Custom Class ───────────────────────────────────────────────

	it('applies custom class to root', () => {
		const { container } = render(Switch, { class: 'my-switch' })
		const el = container.querySelector('[data-switch]')
		expect(el?.classList.contains('my-switch')).toBe(true)
	})
})
