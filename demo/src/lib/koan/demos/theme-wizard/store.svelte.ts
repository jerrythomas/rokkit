/**
 * Theme wizard shared state — palettes, roles, and the helpers the layout's
 * action buttons (Save preset / Export tokens.css) call into.
 *
 * Lifting these out of ThemeWizardCard.svelte lets the layout's ChatResponse
 * action buttons reach the same state without prop drilling. The card writes
 * to this store; the action buttons read from it.
 */

export type Palette = { id: string; label: string; swatches: string[]; inUse: boolean }
export type Role = { role: string; desc: string; light: [string, string]; dark: [string, string] }

export const stepKeys = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '950'] as const

export const shadeLabels = ['50', '200', '500', '700', '950'] as const

export const ramps: Record<string, string[]> = {
	'warm-gray': ['#fbf8f1', '#f0e9d8', '#dfd2af', '#c4b384', '#a18d59', '#7a6845', '#574832', '#3a3025', '#241d16', '#13100b'],
	shu: ['#fff8f5', '#fdd6c6', '#f7a18b', '#ed7559', '#dd4d2e', '#a83d1f', '#7a2a14', '#52190c', '#310f07', '#1a0703'],
	slate: ['#f8fafc', '#f1f5f9', '#e2e8f0', '#cbd5e1', '#94a3b8', '#64748b', '#475569', '#334155', '#1e293b', '#0f172a'],
	neutral: ['#fafafa', '#f5f5f5', '#e5e5e5', '#d4d4d4', '#a3a3a3', '#737373', '#525252', '#404040', '#262626', '#171717']
}

// Wizard role name → Rokkit named-token CSS variable.
export const ROLE_TO_VAR: Record<string, string> = {
	'paper': '--paper',
	'paper-2': '--paper-soft',
	'paper-3': '--paper-mute',
	'edge': '--paper-edge',
	'ink': '--ink',
	'ink-2': '--ink-mute',
	'accent': '--accent'
}

const STORAGE_KEY = 'rokkit-demo.theme-wizard-preset'

function defaultPalettes(): Palette[] {
	return [
		{ id: 'warm-gray', label: 'warm gray', swatches: ['#f7f3ea', '#ece4d2', '#d6c8a8', '#9c8e72', '#3a3528'], inUse: true },
		{ id: 'slate', label: 'slate', swatches: ['#f8fafc', '#e2e8f0', '#94a3b8', '#475569', '#0f172a'], inUse: true },
		{ id: 'neutral', label: 'neutral', swatches: ['#fafafa', '#e5e5e5', '#a3a3a3', '#525252', '#171717'], inUse: false },
		{ id: 'shu', label: 'shu', swatches: ['#fff2ee', '#fcd4c6', '#f08667', '#a83d1f', '#5c1d0e'], inUse: false }
	]
}

function defaultRoles(): Role[] {
	// Note: all step values must appear in `stepKeys`. The mockup uses 950 (not
	// 900) as the darkest step, so keep that convention here.
	return [
		{ role: 'paper', desc: 'page surface', light: ['warm-gray', '100'], dark: ['warm-gray', '950'] },
		{ role: 'paper-2', desc: 'raised, cards', light: ['warm-gray', '50'], dark: ['warm-gray', '950'] },
		{ role: 'paper-3', desc: 'sunken, hover', light: ['warm-gray', '200'], dark: ['warm-gray', '800'] },
		{ role: 'edge', desc: 'hairlines', light: ['warm-gray', '300'], dark: ['warm-gray', '700'] },
		{ role: 'ink', desc: 'primary text', light: ['warm-gray', '950'], dark: ['warm-gray', '100'] },
		{ role: 'ink-2', desc: 'secondary text', light: ['warm-gray', '700'], dark: ['warm-gray', '300'] },
		{ role: 'accent', desc: 'links · ctas', light: ['shu', '500'], dark: ['shu', '400'] }
	]
}

function loadStoredPreset(): { palettes: Palette[]; roles: Role[] } | null {
	if (typeof localStorage === 'undefined') return null
	try {
		const raw = localStorage.getItem(STORAGE_KEY)
		if (!raw) return null
		const parsed = JSON.parse(raw) as { palettes?: Palette[]; roles?: Role[] }
		if (!Array.isArray(parsed.palettes) || !Array.isArray(parsed.roles)) return null
		return { palettes: parsed.palettes, roles: parsed.roles }
	} catch {
		return null
	}
}

const initial = loadStoredPreset()

export const wizardState = $state<{
	palettes: Palette[]
	roles: Role[]
}>({
	palettes: initial?.palettes ?? defaultPalettes(),
	roles: initial?.roles ?? defaultRoles()
})

export function savePreset(): void {
	if (typeof localStorage === 'undefined') return
	const snapshot = {
		palettes: wizardState.palettes,
		roles: wizardState.roles
	}
	localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot))
}

export function resetPreset(): void {
	wizardState.palettes = defaultPalettes()
	wizardState.roles = defaultRoles()
	if (typeof localStorage !== 'undefined') localStorage.removeItem(STORAGE_KEY)
}

export function exportTokensCss(): string {
	const lightDecls: string[] = []
	const darkDecls: string[] = []
	for (const r of wizardState.roles) {
		const varName = ROLE_TO_VAR[r.role]
		if (!varName) continue
		const lightRamp = ramps[r.light[0]]
		const darkRamp = ramps[r.dark[0]]
		const lightIdx = stepKeys.indexOf(r.light[1] as typeof stepKeys[number])
		const darkIdx = stepKeys.indexOf(r.dark[1] as typeof stepKeys[number])
		if (lightRamp && lightIdx >= 0) {
			lightDecls.push(`\t${varName}: ${lightRamp[lightIdx]}; /* ${r.light[0]} · ${r.light[1]} */`)
		}
		if (darkRamp && darkIdx >= 0) {
			darkDecls.push(`\t${varName}: ${darkRamp[darkIdx]}; /* ${r.dark[0]} · ${r.dark[1]} */`)
		}
	}
	return [
		'/* Rokkit theme tokens — exported from the Koan Theme Wizard */',
		':root {',
		...lightDecls,
		'}',
		'',
		'[data-mode="dark"] {',
		...darkDecls,
		'}',
		''
	].join('\n')
}

export function downloadTokensCss(filename = 'tokens.css'): void {
	if (typeof document === 'undefined') return
	const css = exportTokensCss()
	const blob = new Blob([css], { type: 'text/css;charset=utf-8' })
	const url = URL.createObjectURL(blob)
	const a = document.createElement('a')
	a.href = url
	a.download = filename
	document.body.appendChild(a)
	a.click()
	a.remove()
	// Give the browser a tick to start the download before revoking the blob URL.
	setTimeout(() => URL.revokeObjectURL(url), 1000)
}
