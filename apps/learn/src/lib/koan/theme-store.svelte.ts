import type { SavedTheme, WizardMode, WizardState } from './types'
import { SvelteDate } from 'svelte/reactivity'
import { read, write, clear } from './persistence'
import { theme as legacyTheme } from '$lib/stores/theme.svelte'

// NOTE: Breaking change — keys renamed from 'koan.*' to 'rokkit-site.*'.
// Existing local state under the old keys is silently ignored on next load.
const KEYS = {
	active: 'rokkit-site.theme.active',
	saved: 'rokkit-site.themes',
	draft: 'rokkit-site.theme-wizard.draft',
	mode: 'rokkit-site.mode'
} as const

function loadSaved(): SavedTheme[] {
	return read<SavedTheme[]>(KEYS.saved, (v) => Array.isArray(v)) ?? []
}

function loadActive(saved: SavedTheme[]): SavedTheme | null {
	const id = read<string>(KEYS.active, (v) => typeof v === 'string')
	if (!id) return null
	return saved.find((t) => t.id === id) ?? null
}

function loadDraft(): WizardState | null {
	return read<WizardState>(KEYS.draft, (v) => {
		const candidate = v as Record<string, unknown> | null
		return typeof candidate?.preset === 'string'
	})
}

function loadMode(): WizardMode {
	return read<WizardMode>(KEYS.mode, (v) => v === 'light' || v === 'dark' || v === 'auto') ?? 'auto'
}

const savedInit = loadSaved()

export const themeStore = $state({
	active: loadActive(savedInit),
	saved: savedInit,
	draft: loadDraft(),
	mode: loadMode() as WizardMode
})

export function saveTheme(state: WizardState): SavedTheme {
	const now = new SvelteDate().toISOString()
	const theme: SavedTheme = {
		...state,
		id: `t-${Date.now().toString(36)}`,
		createdAt: now,
		updatedAt: now
	}
	themeStore.saved = [...themeStore.saved, theme]
	write(KEYS.saved, themeStore.saved)
	return theme
}

export function setActiveTheme(id: string | null) {
	if (id === null) {
		themeStore.active = null
		clear(KEYS.active)
		return
	}
	const theme = themeStore.saved.find((t) => t.id === id) ?? null
	themeStore.active = theme
	if (theme) write(KEYS.active, id)
}

export function setMode(mode: WizardMode) {
	themeStore.mode = mode
	write(KEYS.mode, mode)
	// Delegate to legacy theme store so 'rokkit-site.mode' is updated,
	// which is read by the flash-prevention inline script in app.html on next paint.
	legacyTheme.setMode(mode as string)
}

let draftTimer: ReturnType<typeof setTimeout> | null = null
export function saveDraft(state: WizardState) {
	themeStore.draft = state
	if (draftTimer) clearTimeout(draftTimer)
	draftTimer = setTimeout(() => write(KEYS.draft, state), 250)
}

export function clearDraft() {
	themeStore.draft = null
	if (draftTimer) clearTimeout(draftTimer)
	clear(KEYS.draft)
}
