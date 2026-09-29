import type { LayoutOptions } from './types.js'

/**
 * Every key `LayoutOptions` defines. Kept beside the type on purpose — a key added there and
 * missed here would warn about a legitimate option, which is worse than the silence this
 * exists to fix. `spec/options.spec.ts` compares the two.
 */
export const LAYOUT_OPTION_KEYS = [
	'density',
	'arrange',
	'edgeStyle',
	'focus',
	'expanded',
	'groupBy',
	'nestBy',
	'sizeBy',
	'sizeScale',
	'depth',
	'focusPath',
	'levels'
] as const

/**
 * Which options have an EFFECT under each built-in layout.
 *
 * A control wired to an option the active layout ignores is worse than a missing one: it looks
 * like a knob, it moves, and the picture does not change — so the reader concludes the view is
 * broken rather than that the control does not apply. `names | keys | full` over a treemap is
 * the plainest case, since a treemap box has no row list to thin.
 *
 * Exported because it is a fact about the layout, not about any one consumer's control panel.
 * A hand-maintained copy in a UI drifts the first time a layout gains or drops an option.
 *
 * Two entries are not simply "what the layout function reads", and both are deliberate:
 *   - `edgeStyle` is applied by `GraphState` when it draws a path, not by the layout. It
 *     therefore applies wherever a layout produces edges — which `world` does not.
 *   - `neighborhood` takes no `density`: it builds its cards at `full` unconditionally, because
 *     a portrait of one node's surroundings that hides the columns the edges land on defeats
 *     its own purpose.
 */
export const LAYOUT_OPTIONS: Record<string, readonly (typeof LAYOUT_OPTION_KEYS)[number][]> = {
	cluster: ['density', 'arrange', 'edgeStyle', 'expanded', 'groupBy', 'nestBy'],
	neighborhood: ['edgeStyle', 'expanded', 'focus', 'depth'],
	points: ['edgeStyle', 'sizeBy', 'sizeScale'],
	world: ['sizeBy', 'focusPath', 'levels']
}

/** Whether a control for `option` should be offered while `layout` is active. */
export function appliesTo(layout: string, option: string): boolean {
	return LAYOUT_OPTIONS[layout]?.includes(option as never) ?? true
}

/** Warn once per unknown key, ever. A layout re-runs on every render. */
const warned = new Set<string>()

/** Bundlers replace this; `process` is undefined in a browser, hence the guarded read. */
function isProduction(): boolean {
	return typeof process !== 'undefined' && process.env?.NODE_ENV === 'production'
}

/**
 * Tell a caller when an option was discarded.
 *
 * `LayoutOptions` is not a closed check once the object reaches a layout through a variable —
 * TypeScript's excess-property check only fires on an object literal at the call site. So
 * `neighborhood(model, opts)` where `opts` carries `depth: 2` type-checks, runs, and returns
 * a correct-looking diagram that silently ignored the option (#162).
 *
 * Silence is the problem, not the unknown key: the caller has no way to tell "this layout
 * does not support depth" from "depth worked and two hops is what you are looking at".
 */
export function warnUnknownOptions(options: LayoutOptions, layout: string): void {
	if (isProduction()) return

	for (const key of Object.keys(options)) {
		if ((LAYOUT_OPTION_KEYS as readonly string[]).includes(key)) continue
		const seen = `${layout}:${key}`
		if (warned.has(seen)) continue
		warned.add(seen)
		// The one place a console call is the POINT rather than a leftover: a discarded option
		// has no other channel back to the caller, and throwing would make an unknown key fatal
		// for a diagram that still renders correctly. Dev-only and deduped above.
		// eslint-disable-next-line no-console
		console.warn(
			`[@rokkit/graph] \`${layout}\` received unknown option \`${key}\` and ignored it. ` +
				`Known options: ${LAYOUT_OPTION_KEYS.join(', ')}.`
		)
	}
}

/** Test seam — the dedupe is module state and would leak between cases otherwise. */
export function resetOptionWarnings(): void {
	warned.clear()
}
