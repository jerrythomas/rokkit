import { describe, it, expect, beforeEach } from 'vitest'
import {
	themeStore,
	saveTheme,
	setActiveTheme,
	setMode,
	saveDraft,
	clearDraft
} from '../../src/lib/koan/theme-store.svelte'
import type { WizardState } from '../../src/lib/koan/types'

const blankWizard: WizardState = {
	preset: 'zen-sumi',
	style: 'zen-sumi',
	mode: 'auto',
	density: 'comfortable',
	roundedness: 'soft',
	name: 'Test'
}

describe('theme-store', () => {
	beforeEach(() => {
		localStorage.clear()
		themeStore.saved = []
		themeStore.active = null
		themeStore.draft = null
		themeStore.mode = 'auto'
	})

	it('saveTheme appends and persists', () => {
		saveTheme(blankWizard)
		expect(themeStore.saved.length).toBe(1)
		expect(themeStore.saved[0].name).toBe('Test')
		expect(themeStore.saved[0].id).toMatch(/^t-/)
	})

	it('setActiveTheme persists', () => {
		const t = saveTheme(blankWizard)
		setActiveTheme(t.id)
		expect(themeStore.active?.id).toBe(t.id)
		expect(localStorage.getItem('rokkit-site.theme.active')).toBe(JSON.stringify(t.id))
	})

	it('setMode persists', () => {
		setMode('dark')
		expect(themeStore.mode).toBe('dark')
		expect(localStorage.getItem('rokkit-site.mode')).toBe(JSON.stringify('dark'))
	})

	it('saveDraft and clearDraft round-trip', () => {
		saveDraft(blankWizard)
		expect(themeStore.draft?.name).toBe('Test')
		clearDraft()
		expect(themeStore.draft).toBeNull()
	})
})
