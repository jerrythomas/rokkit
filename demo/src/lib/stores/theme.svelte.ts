/**
 * Skin / radius / role-overrides store — the demo's extras on top of vibe.
 *
 * Mode, style, and density live in `vibe` (from @rokkit/states), and the
 * root +layout.svelte wires vibe to the DOM via `use:themable`. This store
 * delegates those three through to vibe so existing call sites keep working,
 * and owns the concepts vibe doesn't track natively:
 *   - skin (named palette set; mutates CSS vars via applySkin)
 *   - radius (corner rounding scale; mirrored to body.dataset.radius)
 *   - per-role color overrides on top of the chosen skin
 *
 * Persistence:
 *   - vibe state (mode/style/density)  → localStorage['rokkit-theme'], owned by
 *     the `themable` action in the root layout.
 *   - skin / radius / role overrides   → localStorage['rokkit-skin'], owned here.
 */

import { browser } from '$app/environment'
import { vibe } from '@rokkit/states'
import { applySkin, applyRoleColor, skinDefinitions } from '$lib/data/skins'

const SKIN_KEY = 'rokkit-skin'
const ROLES = ['surface', 'primary', 'secondary', 'accent'] as const

function readStored<T>(field: string, fallback: T): T {
	if (!browser) return fallback
	try {
		const stored = JSON.parse(localStorage.getItem(SKIN_KEY) || '{}')
		return (stored[field] as T) ?? fallback
	} catch {
		return fallback
	}
}

function persistField(field: string, value: unknown) {
	if (!browser) return
	try {
		const stored = JSON.parse(localStorage.getItem(SKIN_KEY) || '{}')
		stored[field] = value
		localStorage.setItem(SKIN_KEY, JSON.stringify(stored))
	} catch {}
}

function loadRoleOverrides(): Record<string, string> {
	if (!browser) return {}
	try {
		const stored = JSON.parse(localStorage.getItem(SKIN_KEY) || '{}')
		const overrides = (stored.roleOverrides as Record<string, string>) || {}
		const result: Record<string, string> = {}
		for (const role of ROLES) if (overrides[role]) result[role] = overrides[role]
		return result
	} catch {
		return {}
	}
}

function createThemeStore() {
	// Read the initial radius once so the body-dataset sync below uses the
	// stored value directly (not a reactive read of `radius`, which would
	// only capture the initial value at module-load time and miss later
	// updates — and trip Svelte's `state_referenced_locally` warning).
	const initialRadius = readStored('radius', 'soft')
	let radius = $state(initialRadius)
	let skin = $state(readStored('skin', 'default'))
	let roleOverrides = $state<Record<string, string>>(loadRoleOverrides())

	function setRadius(v: string) {
		radius = v
		if (browser) document.body.dataset.radius = v
		persistField('radius', v)
	}

	if (browser) document.body.dataset.radius = initialRadius

	return {
		// vibe delegates — read/write the canonical store directly.
		get style() {
			return vibe.style
		},
		get mode() {
			return vibe.mode
		},
		get density() {
			return vibe.density
		},
		setStyle(v: string) {
			vibe.style = v
		},
		setMode(v: string) {
			vibe.mode = v
		},
		setDensity(v: string) {
			vibe.density = v
		},
		toggleMode() {
			vibe.mode = vibe.mode === 'dark' ? 'light' : 'dark'
		},

		// Local-only state — skin and radius are vibe-adjacent extras.
		get radius() {
			return radius
		},
		get skin() {
			return skin
		},
		get roleOverrides() {
			return roleOverrides
		},

		setRadius,

		setSkin(v: string) {
			skin = v
			roleOverrides = {}
			persistField('skin', v)
			persistField('roleOverrides', {})
			applySkin(v)
		},

		setRoleColor(role: string, palette: string) {
			roleOverrides = { ...roleOverrides, [role]: palette }
			persistField('roleOverrides', roleOverrides)
			applyRoleColor(role, palette)
		},

		getRoleColor(role: string): string {
			if (roleOverrides[role]) return roleOverrides[role]
			const skinDef = skinDefinitions.find((s) => s.name === skin)
			return (skinDef?.[role as keyof typeof skinDef] as string) ?? ''
		},

		// Re-apply skin and role overrides on mount.
		restoreSkin() {
			if (skin !== 'default') applySkin(skin)
			for (const [role, palette] of Object.entries(roleOverrides)) {
				applyRoleColor(role, palette)
			}
		}
	}
}

export const theme = createThemeStore()
