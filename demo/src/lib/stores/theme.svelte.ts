/**
 * Shared theme state — syncs body dataset with Svelte reactive state.
 * Import this store in any component that needs to read or write theme axes.
 */

import { browser } from '$app/environment'
import { applySkin, applyRoleColor, skinDefinitions } from '$lib/data/skins'

function readBody(key: string, fallback: string) {
	return browser ? (document.body.dataset[key] || fallback) : fallback
}

function readStored(key: string, fallback: string): string {
	if (!browser) return fallback
	try {
		const stored = JSON.parse(localStorage.getItem('rokkit-site') || '{}')
		return stored[key] ?? fallback
	} catch {
		return fallback
	}
}

function persist(key: string, value: string) {
	if (!browser) return
	// Resolve 'auto' mode to the actual system preference for body.dataset.mode
	// so CSS [data-mode="dark"] selectors match. Keep 'auto' in localStorage so
	// the user's choice persists across system theme changes.
	let resolved = value
	if (key === 'mode' && value === 'auto') {
		resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
	}
	document.body.dataset[key] = resolved
	try {
		const stored = JSON.parse(localStorage.getItem('rokkit-site') || '{}')
		stored[key] = value
		localStorage.setItem('rokkit-site', JSON.stringify(stored))
	} catch {}
}

function persistSkinData(key: string, value: string) {
	if (!browser) return
	try {
		const stored = JSON.parse(localStorage.getItem('rokkit-site') || '{}')
		stored[key] = value
		localStorage.setItem('rokkit-site', JSON.stringify(stored))
	} catch {}
}

function clearRoleOverrides() {
	if (!browser) return
	try {
		const stored = JSON.parse(localStorage.getItem('rokkit-site') || '{}')
		const roles = ['surface', 'primary', 'secondary', 'accent']
		for (const role of roles) {
			delete stored[`role-${role}`]
		}
		localStorage.setItem('rokkit-site', JSON.stringify(stored))
	} catch {}
}

function loadRoleOverrides(): Record<string, string> {
	if (!browser) return {}
	try {
		const stored = JSON.parse(localStorage.getItem('rokkit-site') || '{}')
		const roles = ['surface', 'primary', 'secondary', 'accent']
		const result: Record<string, string> = {}
		for (const role of roles) {
			if (stored[`role-${role}`]) result[role] = stored[`role-${role}`]
		}
		return result
	} catch {
		return {}
	}
}

function createThemeStore() {
	let style    = $state(readBody('style',   'zen-sumi'))
	let mode     = $state(readBody('mode',    'dark'))
	let density  = $state(readBody('density', 'comfortable'))
	let radius   = $state(readBody('radius',  'soft'))
	let skin     = $state(readStored('skin',  'default'))

	/** Per-role overrides: role -> paletteName. Loaded once at create time
	 *  via a helper so the $state initializer doesn't read its own initial
	 *  value (which would trigger Svelte's "captures initial value" warning). */
	let roleOverrides = $state<Record<string, string>>(loadRoleOverrides())

	return {
		get style()   { return style },
		get mode()    { return mode },
		get density() { return density },
		get radius()  { return radius },
		get skin()    { return skin },
		get roleOverrides() { return roleOverrides },

		setStyle(v: string)   { style = v;   persist('style', v) },
		setMode(v: string)    { mode = v;    persist('mode', v) },
		setDensity(v: string) { density = v; persist('density', v) },
		setRadius(v: string)  { radius = v;  persist('radius', v) },

		setSkin(v: string) {
			skin = v
			roleOverrides = {}
			clearRoleOverrides()
			persistSkinData('skin', v)
			applySkin(v)
		},

		setRoleColor(role: string, palette: string) {
			roleOverrides = { ...roleOverrides, [role]: palette }
			persistSkinData(`role-${role}`, palette)
			applyRoleColor(role, palette)
		},

		/** Get the effective palette for a role (override or skin default) */
		getRoleColor(role: string): string {
			if (roleOverrides[role]) return roleOverrides[role]
			const skinDef = skinDefinitions.find(s => s.name === skin)
			return skinDef?.[role as keyof typeof skinDef] as string ?? ''
		},

		toggleMode() {
			const next = mode === 'dark' ? 'light' : 'dark'
			this.setMode(next)
		},

		/** Re-apply the current skin (called on mount to restore state) */
		restoreSkin() {
			if (skin !== 'default') {
				applySkin(skin)
			}
			// Re-apply any role overrides on top
			for (const [role, palette] of Object.entries(roleOverrides)) {
				applyRoleColor(role, palette)
			}
		}
	}
}

export const theme = createThemeStore()
