/**
 * Color Mode Manager
 *
 * Bridges three-mode UI (system/light/dark) with vibe's two-mode store (light/dark).
 * Resolves 'system' to actual OS preference via matchMedia.
 */

export type ColorMode = 'system' | 'light' | 'dark'
export type ResolvedMode = 'light' | 'dark'

/**
 * Resolve a ColorMode to an actual light/dark value.
 * When 'system', queries the OS preference via matchMedia.
 */
export function resolveMode(mode: ColorMode): ResolvedMode {
	if (mode === 'system') {
		if (typeof window !== 'undefined') {
			return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
		}
		return 'dark'
	}
	return mode
}

/**
 * Theme target interface — anything with a settable mode property.
 * Compatible with the vibe singleton from @rokkit/states.
 */
interface ThemeTarget {
	mode: string
}

/**
 * Reactive color mode manager that tracks system/light/dark,
 * resolves to actual light/dark, and syncs to a theme target (e.g. vibe).
 */
export class ColorModeManager {
	#mode = $state<ColorMode>('system')
	#resolved = $state<ResolvedMode>('dark')
	#target: ThemeTarget

	constructor(target: ThemeTarget, initialMode: ColorMode = 'system') {
		this.#target = target
		this.#mode = initialMode
		this.#resolved = resolveMode(initialMode)
		this.#target.mode = this.#resolved
	}

	get mode(): ColorMode {
		return this.#mode
	}

	set mode(value: ColorMode) {
		if (value === this.#mode) return
		this.#mode = value
		this.#resolved = resolveMode(value)
		this.#target.mode = this.#resolved
	}

	get resolved(): ResolvedMode {
		return this.#resolved
	}

	/**
	 * Start listening for OS preference changes.
	 * Returns a cleanup function to stop listening.
	 * Call in onMount or $effect.root.
	 */
	listen(): () => void {
		if (typeof window === 'undefined') return () => {}

		const mq = window.matchMedia('(prefers-color-scheme: dark)')
		const handler = () => {
			if (this.#mode === 'system') {
				this.#resolved = resolveMode('system')
				this.#target.mode = this.#resolved
			}
		}
		mq.addEventListener('change', handler)
		return () => mq.removeEventListener('change', handler)
	}
}
