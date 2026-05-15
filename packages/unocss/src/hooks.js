/**
 * SvelteKit hooks for Rokkit theme flash prevention.
 *
 * Injects a synchronous inline script into the HTML <body> that reads
 * persisted theme settings from localStorage and applies them as
 * `data-*` attributes before first paint — preventing FOUC.
 *
 * Usage in hooks.server.js:
 *
 *   import { themeHook } from '@rokkit/unocss/hooks'
 *   export const handle = themeHook()
 *
 * With Paraglide (sequence):
 *
 *   import { sequence } from '@sveltejs/kit/hooks'
 *   import { themeHook } from '@rokkit/unocss/hooks'
 *   export const handle = sequence(themeHook(), paraglideHandle)
 */

/**
 * @typedef {Object} ThemeHookOptions
 * @property {string} [storageKey='rokkit-theme'] — localStorage key for persisted settings
 * @property {string} [defaultStyle] — fallback style if nothing is persisted
 * @property {string} [defaultMode] — fallback mode ('light'|'dark'); if omitted, uses system preference
 * @property {string} [defaultDensity='comfortable'] — fallback density
 * @property {string} [defaultRadius='soft'] — fallback radius
 */

/**
 * Generates the inline flash-prevention script.
 *
 * @param {ThemeHookOptions} opts
 * @returns {string}
 */
function buildInitScript(opts) {
	const key = opts.storageKey || 'rokkit-theme'
	const ds = opts.defaultStyle ? `'${opts.defaultStyle}'` : "void 0"
	const dd = opts.defaultDensity ? `'${opts.defaultDensity}'` : "'comfortable'"
	const dr = opts.defaultRadius ? `'${opts.defaultRadius}'` : "'soft'"

	// The script reads localStorage, falls back to defaults, and sets body dataset.
	// Mode falls back to system preference via matchMedia if not persisted.
	const dm = opts.defaultMode
		? `'${opts.defaultMode}'`
		: "(matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light')"

	return `<script>;(function(){try{var t=JSON.parse(localStorage.getItem('${key}')||'{}');var b=document.body;if(t.style||${ds})b.dataset.style=t.style||${ds};var m=t.mode||${dm};if(m==='auto')m=matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light';b.dataset.mode=m;b.dataset.density=t.density||${dd};b.dataset.radius=t.radius||${dr};if(t.skin)b.dataset.skin=t.skin}catch(e){}})()</script>`
}

/**
 * Returns the inline script tag string for manual injection in transformPageChunk.
 * Use this when composing with other hooks that also use transformPageChunk.
 *
 *   import { themeInitScript } from '@rokkit/unocss/hooks'
 *   const initScript = themeInitScript({ storageKey: 'my-key' })
 *   // In transformPageChunk: html.replace(/(<body[^>]*>)/, `$1${initScript}`)
 *
 * @param {ThemeHookOptions} [options]
 * @returns {string} — the full `<script>...</script>` tag
 */
export function themeInitScript(options = {}) {
	return buildInitScript(options)
}

/**
 * Creates a SvelteKit handle function that injects the theme flash-prevention script.
 * Use this as a standalone handle or with sequence().
 *
 *   import { themeHook } from '@rokkit/unocss/hooks'
 *   export const handle = themeHook()
 *
 *   // Or with sequence:
 *   export const handle = sequence(themeHook(), otherHook)
 *
 * @param {ThemeHookOptions} [options]
 * @returns {import('@sveltejs/kit').Handle}
 */
export function themeHook(options = {}) {
	const script = buildInitScript(options)

	return ({ event, resolve }) => {
		return resolve(event, {
			transformPageChunk({ html }) {
				return html.replace(/(<body[^>]*>)/, `$1${script}`)
			}
		})
	}
}
