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

	// Write to BOTH documentElement and body. CSS selectors use
	// `[data-style='X'] descendant` so matching the html element is
	// sufficient — and the html element exists when this script runs
	// in <head>, which gives us a true pre-paint application. The body
	// mirror keeps the existing themable/SvelteKit data flow happy
	// since `themable` reads/writes body.dataset.
	// `?theme=` / `?mode=` / `?density=` query params take highest priority
	// so embed iframes and shareable URLs can pin a configuration without
	// touching the consumer's persisted state.
	return `<script>;(function(){try{var t=JSON.parse(localStorage.getItem('${key}')||'{}');var qs=new URLSearchParams(location.search);var qStyle=qs.get('theme');var qMode=qs.get('mode');var qDensity=qs.get('density');var r=document.documentElement;var b=document.body;var style=qStyle||t.style||${ds};if(style){r.dataset.style=style;if(b)b.dataset.style=style}var m=qMode||t.mode||${dm};if(m==='auto')m=matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light';r.dataset.mode=m;if(b)b.dataset.mode=m;var d=qDensity||t.density||${dd};r.dataset.density=d;if(b)b.dataset.density=d;var rad=t.radius||${dr};r.dataset.radius=rad;if(b)b.dataset.radius=rad;if(t.skin){r.dataset.skin=t.skin;if(b)b.dataset.skin=t.skin}}catch(e){}})()</script>`
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
