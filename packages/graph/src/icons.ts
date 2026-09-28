/**
 * Default glyph per node kind and row badge.
 *
 * `i-glyph:<name>` is the vocabulary this repo actually ships — `packages/icons/lib/glyph.json`,
 * 697 names, safelisted wholesale by the app's UnoCSS config. An earlier version of this map
 * used `i-graph-<kind>`, which is defined nowhere: UnoCSS emitted no rule, so every kind
 * rendered an identical blank box while the class attribute looked perfectly correct.
 * `spec/icons.spec.ts` now checks each name against the collection.
 *
 * A consumer overrides any entry through `<Graph icons={{ view: 'i-lucide-eye' }}>`, which is
 * how a project on a different icon collection adopts this without patching the package.
 */
export const DEFAULT_ICONS: Record<string, string> = {
	// ─── node kinds ───────────────────────────────────────────────────────────
	table: 'i-glyph:table',
	/** A view is a lens over other data, not storage of its own. */
	view: 'i-glyph:eye',
	/** dbd v2's wire string. Materialized = the query is stored, hence layers. */
	materialized_view: 'i-glyph:layers',
	/** Alias: rokkit's themes and demos have said `matview` since slice 1. */
	matview: 'i-glyph:layers',
	function: 'i-glyph:code',
	/** A procedure is invoked for its effects — distinct from a function's value. */
	procedure: 'i-glyph:play-circle',
	/** dbd emits this; it fires on an event rather than being called. */
	trigger: 'i-glyph:bolt',
	/** A closed set of labels. */
	enum: 'i-glyph:tag',

	// ─── row badges ───────────────────────────────────────────────────────────
	/** Identity constraint. The collection has no key glyph; `lock` is the closest. */
	pk: 'i-glyph:lock',
	/** Points at another entity. */
	fk: 'i-glyph:git-merge',
	uq: 'i-glyph:star',
	/** NOT NULL — the value is guaranteed present. */
	nn: 'i-glyph:shield',

	fallback: 'i-glyph:box'
}
