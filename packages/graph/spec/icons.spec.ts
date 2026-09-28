/* The test that should have existed from the start.
 *
 * `Graph.svelte` shipped `i-graph-table`, `i-graph-view`, `i-graph-matview` … — a vocabulary
 * that is defined NOWHERE. UnoCSS emits nothing for an unknown prefix, so every kind rendered
 * an identical blank 13x13 box with `mask: none` and `background: none`, while the code, the
 * theme comments ("the GLYPH carries the kind — i-graph-table and i-graph-view are different
 * shapes") and the docs all read as though icons worked.
 *
 * A component test cannot catch this: the class attribute is present and correct-looking. The
 * only thing that catches it is checking the name against the collection that has to resolve
 * it. So that is what this does. */

import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { DEFAULT_ICONS } from '../src/icons.js'

// cwd is the REPO ROOT even for the `graph` project — same convention as
// packages/themes/spec/graph-css.spec.js.
const collection = JSON.parse(
	readFileSync(join(process.cwd(), 'packages/icons/lib/glyph.json'), 'utf-8')
) as { icons: Record<string, unknown> }

/** `i-glyph:table` -> `table`, the key UnoCSS has to find in the collection. */
const glyphName = (cls: string) => cls.replace(/^i-glyph:/, '')

describe('default icons', () => {
	it('names a glyph that actually exists, for every entry', () => {
		const missing = Object.entries(DEFAULT_ICONS)
			.filter(([, cls]) => !(glyphName(cls) in collection.icons))
			.map(([key, cls]) => `${key} -> ${cls}`)

		expect(missing).toEqual([])
	})

	it('uses the i-glyph: prefix the repo actually ships', () => {
		const wrong = Object.values(DEFAULT_ICONS).filter((cls) => !cls.startsWith('i-glyph:'))

		expect(wrong).toEqual([])
	})

	it('covers every node kind dbd v2 can emit', () => {
		// `materialized_view` and `trigger` are dbd's wire strings. Missing either means a real
		// schema renders those nodes with the fallback glyph and no theme rule.
		for (const kind of ['table', 'view', 'materialized_view', 'function', 'procedure', 'trigger']) {
			expect(DEFAULT_ICONS, kind).toHaveProperty(kind)
		}
	})

	it('keeps `matview` as an alias of `materialized_view`', () => {
		// dbd's wire string is `materialized_view`; rokkit's themes and demo have said `matview`
		// since slice 1. Both resolve, so neither consumer silently falls back.
		expect(DEFAULT_ICONS.matview).toBe(DEFAULT_ICONS.materialized_view)
	})

	it('gives every node kind a DISTINCT glyph', () => {
		// The point of a per-kind icon. `matview` is excluded as a declared alias.
		const kinds = ['table', 'view', 'materialized_view', 'function', 'procedure', 'trigger', 'enum']
		const used = kinds.map((k) => DEFAULT_ICONS[k])

		expect(new Set(used).size).toBe(kinds.length)
	})

	it('gives every row badge a distinct glyph', () => {
		const badges = ['pk', 'fk', 'uq', 'nn'].map((b) => DEFAULT_ICONS[b])

		expect(new Set(badges).size).toBe(4)
	})

	it('ships a fallback for an unknown kind', () => {
		expect(DEFAULT_ICONS.fallback).toBeTruthy()
	})
})
