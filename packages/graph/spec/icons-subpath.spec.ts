/* The icon map has to be importable from a NODE context.
 *
 * A consumer must safelist these classes: the component picks a node's icon at runtime from
 * its kind, so the names never appear in source and UnoCSS's extractor purges them — the
 * icons silently vanish and every card renders a blank box. The natural way to do that is
 * `safelist: Object.values(DEFAULT_ICONS)` in uno.config.ts.
 *
 * But a UnoCSS config is loaded by Node, and the main barrel re-exports `Graph.svelte`, which
 * Node cannot parse: `ERR_UNKNOWN_FILE_EXTENSION`. So the one place it is required is the one
 * place it was unreachable. `@rokkit/graph/icons` exists for exactly that, and this pins it. */

import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const pkg = JSON.parse(
	readFileSync(join(process.cwd(), 'packages/graph/package.json'), 'utf-8')
) as { exports: Record<string, { default: string }> }

describe('@rokkit/graph/icons', () => {
	it('is a declared subpath export', () => {
		expect(pkg.exports['./icons']).toBeDefined()
	})

	it('pulls in NOTHING that Node cannot parse', () => {
		// A single `.svelte` import anywhere in its graph breaks a uno.config.ts.
		const source = readFileSync(join(process.cwd(), 'packages/graph/src/icons.ts'), 'utf-8')
		const imports = [...source.matchAll(/from\s+'([^']+)'/g)].map((m) => m[1])

		expect(imports).toEqual([])
	})

	it('exports the same map as the main barrel', async () => {
		const direct = await import('../src/icons.js')
		const barrel = await import('../src/index.js')

		expect(direct.DEFAULT_ICONS).toBe(barrel.DEFAULT_ICONS)
	})
})
