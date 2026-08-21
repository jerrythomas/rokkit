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

/**
 * A class, not a factory returning an object literal.
 *
 * The store is one big set of accessors, and a factory has to return them all in
 * a single object expression — which is both a 60-line function and impossible to
 * split, because getters cannot be spread: `{ ...group() }` copies their current
 * VALUES and freezes the store at construction. As class members each accessor is
 * its own small named thing and the groups can be separated by comment.
 *
 * Instantiated once at module scope, so behaviour is identical to the factory.
 */
class ThemeStore {
	// Local-only state — radius is a vibe-adjacent extra. Read once here so the
	// constructor's body-dataset sync uses the stored value rather than a reactive
	// read (which would trip Svelte's `state_referenced_locally`).
	#radius = $state(readStored('radius', 'soft'))
	#roleOverrides = $state<Record<string, string>>(loadRoleOverrides())

	constructor() {
		if (browser) document.body.dataset.radius = readStored('radius', 'soft')
	}

	// ─── vibe delegates — read/write the canonical store directly ──────────────

	get style() {
		return vibe.style
	}
	get mode() {
		return vibe.mode
	}
	get density() {
		return vibe.density
	}

	setStyle(v: string) {
		vibe.style = v
	}
	setMode(v: string) {
		vibe.mode = v
	}
	setDensity(v: string) {
		vibe.density = v
	}
	toggleMode() {
		vibe.mode = vibe.mode === 'dark' ? 'light' : 'dark'
	}

	// ─── Local state ──────────────────────────────────────────────────────────
	// `skin` delegates to vibe.skin (themable writes it to data-skin on the body;
	// the UnoCSS preset's [data-skin='name'] CSS handles the rest).

	get radius() {
		return this.#radius
	}
	get skin() {
		return vibe.skin
	}
	get roleOverrides() {
		return this.#roleOverrides
	}

	setRadius(v: string) {
		this.#radius = v
		if (browser) document.body.dataset.radius = v
		persistField('radius', v)
	}

	setSkin(v: string) {
		// Clear per-role overrides when switching skins (they were relative to the
		// previous skin's palette baseline).
		this.#roleOverrides = {}
		persistField('roleOverrides', {})
		// Delegate to vibe — themable writes data-skin on the body, and the preset
		// CSS [data-skin='v'] handles the palette cascade.
		vibe.skin = v
	}

	setRoleColor(role: string, palette: string) {
		this.#roleOverrides = { ...this.#roleOverrides, [role]: palette }
		persistField('roleOverrides', this.#roleOverrides)
		applyRoleColor(role, palette)
	}

	getRoleColor(role: string): string {
		if (this.#roleOverrides[role]) return this.#roleOverrides[role]
		const skinDef = skinDefinitions.find((s) => s.name === vibe.skin)
		return (skinDef?.[role as keyof typeof skinDef] as string) ?? ''
	}

	/**
	 * Re-apply per-role colour overrides on mount. Skin itself no longer needs
	 * restoring — vibe.skin is loaded from localStorage by themable (saved under
	 * STORAGE_KEY / 'rokkit-learn-app', since vibe.save() includes skin). Role
	 * overrides still need JS re-application because they are not in the
	 * config-emitted CSS.
	 */
	restoreSkin() {
		for (const [role, palette] of Object.entries(this.#roleOverrides)) {
			applyRoleColor(role, palette)
		}
	}
}

export const theme = new ThemeStore()
