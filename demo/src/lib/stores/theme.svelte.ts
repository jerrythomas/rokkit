/**
 * Shared theme state — syncs body dataset with Svelte reactive state.
 * Import this store in any component that needs to read or write theme axes.
 */

import { browser } from '$app/environment'

function readBody(key: string, fallback: string) {
	return browser ? (document.body.dataset[key] || fallback) : fallback
}

function persist(key: string, value: string) {
	if (!browser) return
	document.body.dataset[key] = value
	try {
		const stored = JSON.parse(localStorage.getItem('sensei-theme') || '{}')
		stored[key] = value
		localStorage.setItem('sensei-theme', JSON.stringify(stored))
	} catch {}
}

function createThemeStore() {
	let style    = $state(readBody('style',   'zen-sumi'))
	let mode     = $state(readBody('mode',    'dark'))
	let density  = $state(readBody('density', 'comfortable'))
	let radius   = $state(readBody('radius',  'soft'))

	return {
		get style()   { return style },
		get mode()    { return mode },
		get density() { return density },
		get radius()  { return radius },

		setStyle(v: string)   { style = v;   persist('style', v) },
		setMode(v: string)    { mode = v;    persist('mode', v) },
		setDensity(v: string) { density = v; persist('density', v) },
		setRadius(v: string)  { radius = v;  persist('radius', v) },

		toggleMode() {
			const next = mode === 'dark' ? 'light' : 'dark'
			this.setMode(next)
		}
	}
}

export const theme = createThemeStore()
