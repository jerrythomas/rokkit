import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import PaletteManager from '../src/components/PaletteManager.svelte'

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
})
