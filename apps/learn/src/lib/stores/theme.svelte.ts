/**
 * Skin / radius / role-overrides store — the demo's extras on top of vibe.
 *
 * Mode, style, and density live in `vibe` (from @rokkit/states), and the
 * root +layout.svelte wires vibe to the DOM via `use:themable`. This store
 * delegates those three through to vibe so existing call sites keep working.
 *
 * Skin switching now also delegates to `vibe.skin` — the root layout's
 * `use:themable` action writes `data-skin` on the body whenever `vibe.skin`
 * changes, and the UnoCSS preset emits `[data-skin='name']` CSS blocks for
 * all skins defined in `rokkit.config.js`. No runtime `<style>` injection
 * is needed for named skins.
 *
 * This store owns the concepts vibe doesn't track natively:
 *   - radius (corner rounding scale; mirrored to body.dataset.radius)
 *   - per-role color overrides on top of the chosen skin (Phase 2 concern)
 *
 * Persistence (all keyed off the single `STORAGE_KEY` from rokkit.config.js):
 *   - vibe state (mode/style/density/skin) → localStorage[STORAGE_KEY],
 *     owned by the `themable` action in the root layout.
 *   - radius / role overrides → localStorage[`${STORAGE_KEY}-skin`], owned here.
 */

import { browser } from '$app/environment'
import { vibe } from '@rokkit/states'
import { applyRoleColor, skinDefinitions } from '$lib/data/skins'
import { STORAGE_KEY } from '$lib/theme-config'

const SKIN_KEY = `${STORAGE_KEY}-skin`
const ROLES = ['surface', 'primary', 'secondary', 'accent'] as const

// Register all known skins with vibe so SkinSwitcherToggle (which reads
// vibe.allowedSkins) and vibe.skin validation both know the full list.
vibe.allowedSkins = skinDefinitions.map((s) => s.name)

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

		// Local-only state — radius is a vibe-adjacent extra.
		// skin delegates to vibe.skin (which themable writes to data-skin on
		// the body; the UnoCSS preset's [data-skin='name'] CSS handles the rest).
		get radius() {
			return radius
		},
		get skin() {
			return vibe.skin
		},
		get roleOverrides() {
			return roleOverrides
		},

		setRadius,

		setSkin(v: string) {
			// Clear per-role overrides when switching skins (they were relative
			// to the previous skin's palette baseline).
			roleOverrides = {}
			persistField('roleOverrides', {})
			// Delegate to vibe — themable will write data-skin on the body,
			// and the preset CSS [data-skin='v'] handles the palette cascade.
			vibe.skin = v
		},

		setRoleColor(role: string, palette: string) {
			roleOverrides = { ...roleOverrides, [role]: palette }
			persistField('roleOverrides', roleOverrides)
			applyRoleColor(role, palette)
		},

		getRoleColor(role: string): string {
			if (roleOverrides[role]) return roleOverrides[role]
			const skinDef = skinDefinitions.find((s) => s.name === vibe.skin)
			return (skinDef?.[role as keyof typeof skinDef] as string) ?? ''
		},

		// Re-apply per-role color overrides on mount. Skin itself no longer
		// needs restoring — vibe.skin is loaded from localStorage by themable
		// (it's saved as part of the 'rokkit-theme' key since vibe.save()
		// includes skin). Role overrides still need JS re-application because
		// they are not in the config-emitted CSS.
		restoreSkin() {
			for (const [role, palette] of Object.entries(roleOverrides)) {
				applyRoleColor(role, palette)
			}
		}
	}
}

export const theme = createThemeStore()
