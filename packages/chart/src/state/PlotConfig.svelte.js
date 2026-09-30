import { defaultPreset } from '../lib/preset.js'
import { resolvePreset } from '../lib/plot/preset.js'
import { resolveFormat, resolveTooltip, resolveGeom } from '../lib/plot/helpers.js'

/** The frame's margin when the caller sets none. */
export const DEFAULT_MARGIN = Object.freeze({ top: 20, right: 20, bottom: 40, left: 50 })

/**
 * Every input a plot takes, and what `update()` does when a field is omitted.
 *
 * - `keep`: the previous value stays. These are the chart's data and settings; a partial
 *   update (`{ width }` after a resize) must not wipe the rest.
 * - `reset`: the default comes back. These are OVERRIDES — a fixed domain, a forced
 *   orientation, a margin — and an override the caller stopped passing must stop applying.
 *
 * This table is the whole contract; `PlotState-update-contract.spec.js` pins it field by field.
 *
 * @type {ReadonlyArray<{ key: string, fallback: () => unknown, whenOmitted: 'keep' | 'reset' }>}
 */
export const CONFIG_FIELDS = Object.freeze([
	{ key: 'data', fallback: () => [], whenOmitted: 'keep' },
	{ key: 'channels', fallback: () => ({}), whenOmitted: 'keep' },
	{ key: 'labels', fallback: () => ({}), whenOmitted: 'keep' },
	{ key: 'helpers', fallback: () => ({}), whenOmitted: 'keep' },
	{ key: 'preset', fallback: () => undefined, whenOmitted: 'keep' },
	{ key: 'colorMidpoint', fallback: () => undefined, whenOmitted: 'keep' },
	{ key: 'colorScale', fallback: () => undefined, whenOmitted: 'keep' },
	{ key: 'colorScheme', fallback: () => undefined, whenOmitted: 'keep' },
	{ key: 'colorDomain', fallback: () => undefined, whenOmitted: 'reset' },
	{ key: 'xDomain', fallback: () => undefined, whenOmitted: 'reset' },
	{ key: 'yDomain', fallback: () => undefined, whenOmitted: 'reset' },
	{ key: 'width', fallback: () => 600, whenOmitted: 'keep' },
	{ key: 'height', fallback: () => 400, whenOmitted: 'keep' },
	{ key: 'mode', fallback: () => 'light', whenOmitted: 'keep' },
	{ key: 'chartPreset', fallback: () => defaultPreset, whenOmitted: 'keep' },
	{ key: 'onselect', fallback: () => undefined, whenOmitted: 'keep' },
	{ key: 'selectable', fallback: () => false, whenOmitted: 'keep' },
	{ key: 'axisOffset', fallback: () => 0, whenOmitted: 'keep' },
	{ key: 'axisOrigin', fallback: () => [undefined, undefined], whenOmitted: 'reset' },
	{ key: 'margin', fallback: () => undefined, whenOmitted: 'reset' },
	{ key: 'orientation', fallback: () => undefined, whenOmitted: 'reset' },
	{ key: 'continuousCategory', fallback: () => false, whenOmitted: 'reset' },
	{ key: 'sort', fallback: () => undefined, whenOmitted: 'reset' }
])

/**
 * @typedef {Record<string, unknown>} Row
 * @typedef {{ top: number, right: number, bottom: number, left: number }} Margin
 * @typedef {{ x?: string, y?: string, color?: string, fill?: string, pattern?: string, symbol?: string, size?: string }} Channels
 * @typedef {Object} PlotConfigValues
 * @property {Row[]} data
 * @property {Channels} channels
 * @property {Record<string, string>} labels
 * @property {import('../lib/plot/types.js').PlotHelpers} helpers
 * @property {string | undefined} preset
 * @property {number | undefined} colorMidpoint
 * @property {string | undefined} colorScale
 * @property {string | undefined} colorScheme
 * @property {unknown[] | undefined} colorDomain
 * @property {unknown[] | undefined} xDomain
 * @property {unknown[] | undefined} yDomain
 * @property {number} width
 * @property {number} height
 * @property {'light' | 'dark'} mode
 * @property {typeof defaultPreset} chartPreset
 * @property {((detail: unknown) => void) | undefined} onselect
 * @property {boolean} selectable
 * @property {number} axisOffset
 * @property {[number | undefined, number | undefined]} axisOrigin
 * @property {Margin | undefined} margin
 * @property {'horizontal' | 'vertical' | undefined} orientation
 * @property {boolean} continuousCategory
 * @property {'asc' | 'desc' | undefined} sort
 */

/**
 * The plot's inputs — the one job `update()` has. Every other state class reads from here and
 * writes nothing back.
 *
 * One `$state` object rather than a field per input: Svelte proxies it per property, so each
 * reader still tracks only the fields it touches, and the table above can drive construction
 * and update without a hand-written line per field. Values are proxied deeply exactly as the
 * per-field `$state`s before were, which is what row identity (`data.indexOf(row)`) relies on.
 */
export class PlotConfig {
	/** @type {PlotConfigValues} */
	#v = $state(/** @type {PlotConfigValues} */ (Object.fromEntries(CONFIG_FIELDS.map((f) => [f.key, f.fallback()]))))

	/** @param {Record<string, unknown>} [config] */
	constructor(config = {}) {
		const v = /** @type {Record<string, unknown>} */ (this.#v)
		for (const f of CONFIG_FIELDS) v[f.key] = config[f.key] ?? f.fallback()
	}

	/** @param {Record<string, unknown>} [config] */
	update(config = {}) {
		const v = /** @type {Record<string, unknown>} */ (this.#v)
		for (const f of CONFIG_FIELDS) {
			if (config[f.key] !== undefined) v[f.key] = config[f.key]
			else if (f.whenOmitted === 'reset') v[f.key] = f.fallback()
		}
	}

	get data() {
		return this.#v.data
	}
	get channels() {
		return this.#v.channels
	}
	get labels() {
		return this.#v.labels
	}
	get helpers() {
		return this.#v.helpers
	}
	get presetName() {
		return this.#v.preset
	}
	get colorMidpoint() {
		return this.#v.colorMidpoint
	}
	get colorScale() {
		return this.#v.colorScale
	}
	get colorScheme() {
		return this.#v.colorScheme
	}
	get colorDomain() {
		return this.#v.colorDomain
	}
	get xDomain() {
		return this.#v.xDomain
	}
	get yDomain() {
		return this.#v.yDomain
	}
	get width() {
		return this.#v.width
	}
	get height() {
		return this.#v.height
	}
	get mode() {
		return this.#v.mode
	}
	get chartPreset() {
		return this.#v.chartPreset
	}
	get onselect() {
		return this.#v.onselect
	}
	get selectable() {
		return this.#v.selectable
	}
	get axisOffset() {
		return this.#v.axisOffset
	}
	get axisOrigin() {
		return this.#v.axisOrigin
	}
	/** Settable directly as well as through `update()` — callers (and specs) pin a crossing. */
	set axisOrigin(value) {
		this.#v.axisOrigin = value
	}
	get margin() {
		return this.#v.margin
	}
	get orientation() {
		return this.#v.orientation
	}
	get continuousCategory() {
		return this.#v.continuousCategory
	}
	get sort() {
		return this.#v.sort
	}

	// ─── Helper resolution — these read nothing but the inputs ─────────────────
	/** @param {string} field */
	label(field) {
		return this.#v.labels?.[field] ?? field
	}
	/** @param {string} field */
	format(field) {
		return resolveFormat(field, this.#v.helpers)
	}
	tooltip() {
		return resolveTooltip(this.#v.helpers)
	}
	/** @param {string} type */
	geomComponent(type) {
		return resolveGeom(type, this.#v.helpers)
	}
	resolvedPreset() {
		return resolvePreset(this.#v.preset, this.#v.helpers)
	}
}
