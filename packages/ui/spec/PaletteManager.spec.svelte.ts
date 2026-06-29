import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import PaletteManager from '../src/components/PaletteManager.svelte'
import { defaultPaletteConfig } from '../src/types/palette.js'

describe('PaletteManager', () => {
	// ─── Icons ──────────────────────────────────────────────────────

	it('renders default semantic palette-presets icon in hex toggle (presets mode)', () => {
		const { container } = render(PaletteManager)
		// By default, showHexInput is false so we should see the hex icon
		const hexIcon = container.querySelector('[data-palette-hex-icon]')
		expect(hexIcon).toBeTruthy()
		expect(hexIcon?.classList.contains('palette-hex')).toBe(true)
	})

	it('renders default semantic action-save icon in save button', () => {
		const { container } = render(PaletteManager, { showSave: true })
		const saveIcon = container.querySelector('[data-palette-save-icon]')
		expect(saveIcon).toBeTruthy()
		expect(saveIcon?.classList.contains('action-save')).toBe(true)
	})

	it('renders default semantic action-check icon in apply button', () => {
		const { container } = render(PaletteManager, { autoApply: false })
		const checkIcon = container.querySelector('[data-palette-check-icon]')
		expect(checkIcon).toBeTruthy()
		expect(checkIcon?.classList.contains('action-check')).toBe(true)
	})

	it('uses custom icons override', () => {
		const { container } = render(PaletteManager, {
			showSave: true,
			autoApply: false,
			icons: {
				save: 'custom-save',
				check: 'custom-check',
				hex: 'custom-hash',
				presets: 'custom-list'
			}
		})
		const saveIcon = container.querySelector('[data-palette-save-icon]')
		expect(saveIcon?.classList.contains('custom-save')).toBe(true)
		const checkIcon = container.querySelector('[data-palette-check-icon]')
		expect(checkIcon?.classList.contains('custom-check')).toBe(true)
		const hexIcon = container.querySelector('[data-palette-hex-icon]')
		expect(hexIcon?.classList.contains('custom-hash')).toBe(true)
	})

	// ─── Rendering ──────────────────────────────────────────────────

	it('renders data-palette-manager container', () => {
		const { container } = render(PaletteManager)
		expect(container.querySelector('[data-palette-manager]')).toBeTruthy()
	})

	it('renders presets section by default', () => {
		const { container } = render(PaletteManager)
		expect(container.querySelector('[data-palette-presets]')).toBeTruthy()
	})

	it('does not render presets section when showPresets=false', () => {
		const { container } = render(PaletteManager, { showPresets: false })
		expect(container.querySelector('[data-palette-presets]')).toBeNull()
	})

	it('renders preset buttons', () => {
		const { container } = render(PaletteManager)
		const presets = container.querySelectorAll('[data-palette-preset]')
		expect(presets.length).toBeGreaterThan(0)
	})

	it('renders role rows in editor', () => {
		const { container } = render(PaletteManager)
		const roles = container.querySelectorAll('[data-palette-role]')
		expect(roles.length).toBeGreaterThan(0)
	})

	it('renders color selects for each role', () => {
		const { container } = render(PaletteManager)
		const selects = container.querySelectorAll('[data-palette-color-select]')
		expect(selects.length).toBeGreaterThan(0)
	})

	it('renders palette-actions section', () => {
		const { container } = render(PaletteManager)
		expect(container.querySelector('[data-palette-actions]')).toBeTruthy()
	})

	it('does not render save button when showSave=false', () => {
		const { container } = render(PaletteManager, { showSave: false })
		expect(container.querySelector('[data-palette-save]')).toBeNull()
	})

	it('does not render apply button when autoApply=true', () => {
		const { container } = render(PaletteManager, { autoApply: true })
		expect(container.querySelector('[data-palette-apply]')).toBeNull()
	})

	it('renders apply button when autoApply=false', () => {
		const { container } = render(PaletteManager, { autoApply: false })
		expect(container.querySelector('[data-palette-apply]')).toBeTruthy()
	})

	it('applies compact attribute when compact=true', () => {
		const { container } = render(PaletteManager, { compact: true })
		expect(container.querySelector('[data-palette-manager]')?.hasAttribute('data-compact')).toBe(true)
	})

	it('does not render preset names in compact mode', () => {
		const { container } = render(PaletteManager, { compact: true })
		expect(container.querySelector('[data-palette-preset-name]')).toBeNull()
	})

	it('applies custom CSS class', () => {
		const { container } = render(PaletteManager, { class: 'my-pm' })
		expect(container.querySelector('[data-palette-manager]')?.classList.contains('my-pm')).toBe(true)
	})

	// ─── Preset interaction ───────────────────────────────────────────

	it('clicking a preset does not throw', async () => {
		const onchange = vi.fn()
		const { container } = render(PaletteManager, { onchange })
		const preset = container.querySelector('[data-palette-preset]') as HTMLElement
		await expect(fireEvent.click(preset)).resolves.not.toThrow()
	})

	it('clicking a preset calls onchange', async () => {
		const onchange = vi.fn()
		const { container } = render(PaletteManager, { onchange })
		const preset = container.querySelector('[data-palette-preset]') as HTMLElement
		await fireEvent.click(preset)
		expect(onchange).toHaveBeenCalled()
	})

	// ─── Hex toggle ─────────────────────────────────────────────────

	it('clicking hex toggle switches to hex input', async () => {
		const { container } = render(PaletteManager)
		const toggle = container.querySelector('[data-palette-hex-toggle]') as HTMLElement
		await fireEvent.click(toggle)
		// After toggle, hex input should be visible
		expect(container.querySelector('[data-palette-color-input]')).toBeTruthy()
	})

	it('clicking hex toggle twice returns to select', async () => {
		const { container } = render(PaletteManager)
		const toggle = container.querySelector('[data-palette-hex-toggle]') as HTMLElement
		await fireEvent.click(toggle)
		await fireEvent.click(toggle)
		// Back to select
		expect(container.querySelector('[data-palette-color-select]')).toBeTruthy()
	})

	it('after hex toggle, shows presets icon instead of hex icon', async () => {
		const { container } = render(PaletteManager)
		const toggle = container.querySelector('[data-palette-hex-toggle]') as HTMLElement
		await fireEvent.click(toggle)
		expect(container.querySelector('[data-palette-presets-icon]')).toBeTruthy()
	})

	// ─── Hex input ──────────────────────────────────────────────────

	it('typing a valid hex in the input calls onchange', async () => {
		const onchange = vi.fn()
		const { container } = render(PaletteManager, { onchange })
		const toggle = container.querySelector('[data-palette-hex-toggle]') as HTMLElement
		await fireEvent.click(toggle)
		const input = container.querySelector('[data-palette-color-input]') as HTMLInputElement
		Object.defineProperty(input, 'value', { value: '#ff0000', configurable: true, writable: true })
		await fireEvent.input(input, { target: { value: '#ff0000' } })
		expect(onchange).toHaveBeenCalled()
	})

	it('typing an invalid hex does not call onchange', async () => {
		const onchange = vi.fn()
		const { container } = render(PaletteManager, { onchange })
		const toggle = container.querySelector('[data-palette-hex-toggle]') as HTMLElement
		await fireEvent.click(toggle)
		const input = container.querySelector('[data-palette-color-input]') as HTMLInputElement
		await fireEvent.input(input, { target: { value: 'notahex' } })
		expect(onchange).not.toHaveBeenCalled()
	})

	it('typing hex without # prefix auto-adds it', async () => {
		const onchange = vi.fn()
		const { container } = render(PaletteManager, { onchange })
		const toggle = container.querySelector('[data-palette-hex-toggle]') as HTMLElement
		await fireEvent.click(toggle)
		const input = container.querySelector('[data-palette-color-input]') as HTMLInputElement
		await fireEvent.input(input, { target: { value: 'ff0000' } })
		expect(onchange).toHaveBeenCalled()
	})

	// ─── Select change ────────────────────────────────────────────────

	it('changing the select calls onchange', async () => {
		const onchange = vi.fn()
		const { container } = render(PaletteManager, { onchange })
		const select = container.querySelector('[data-palette-color-select]') as HTMLSelectElement
		await fireEvent.change(select, { target: { value: 'blue' } })
		expect(onchange).toHaveBeenCalled()
	})

	// ─── Apply button ─────────────────────────────────────────────────

	it('clicking apply when autoApply=false calls onapply', async () => {
		const onapply = vi.fn()
		const { container } = render(PaletteManager, { autoApply: false, onapply })
		const applyBtn = container.querySelector('[data-palette-apply]') as HTMLElement
		await fireEvent.click(applyBtn)
		expect(onapply).toHaveBeenCalled()
	})

	// ─── Custom palettes ──────────────────────────────────────────────

	it('renders custom palettes section when custom list is provided', () => {
		const custom = [{ name: 'My Theme', mapping: { primary: 'blue', accent: 'red', secondary: 'green', neutral: 'gray', warning: 'yellow', danger: 'rose', info: 'sky', success: 'emerald' } }]
		const { container } = render(PaletteManager, { custom })
		expect(container.querySelector('[data-palette-custom]')).toBeTruthy()
		expect(container.querySelector('[data-palette-custom-item]')).toBeTruthy()
	})

	it('clicking custom palette calls onchange', async () => {
		const onchange = vi.fn()
		const custom = [{ name: 'My Theme', mapping: { primary: 'blue', accent: 'red', secondary: 'green', neutral: 'gray', warning: 'yellow', danger: 'rose', info: 'sky', success: 'emerald' } }]
		const { container } = render(PaletteManager, { custom, onchange })
		const item = container.querySelector('[data-palette-custom-item]') as HTMLElement
		await fireEvent.click(item)
		expect(onchange).toHaveBeenCalled()
	})

	it('does not render custom palettes section when empty', () => {
		const { container } = render(PaletteManager, { custom: [] })
		expect(container.querySelector('[data-palette-custom]')).toBeNull()
	})

	// ─── Shade preview ────────────────────────────────────────────────

	it('renders shade swatches for each role', () => {
		const { container } = render(PaletteManager)
		const shades = container.querySelectorAll('[data-palette-shade]')
		expect(shades.length).toBeGreaterThan(0)
	})

	// ─── Storage key ──────────────────────────────────────────────────

	it('does not throw when storageKey is provided (with mocked localStorage)', () => {
		const getItem = vi.fn(() => null)
		const setItem = vi.fn()
		Object.defineProperty(globalThis, 'localStorage', {
			value: { getItem, setItem, removeItem: vi.fn() },
			configurable: true
		})
		expect(() => render(PaletteManager, { storageKey: 'test-palette' })).not.toThrow()
		Object.defineProperty(globalThis, 'localStorage', {
			value: undefined,
			configurable: true
		})
	})
})
