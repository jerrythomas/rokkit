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
	'depth'
] as const

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
