import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const PKG_DIR = join(process.cwd(), 'packages/graph')
const pkg = JSON.parse(readFileSync(join(PKG_DIR, 'package.json'), 'utf-8'))

describe('@rokkit/graph — manifest', () => {
	it('takes svelte as a peer, never a hard dependency', () => {
		expect(pkg.dependencies?.svelte).toBeUndefined()
		expect(pkg.peerDependencies.svelte).toBe('^5.0.0')
	})

	it('declares no third-party runtime dependencies', () => {
		const thirdParty = Object.keys(pkg.dependencies ?? {}).filter((d) => !d.startsWith('@rokkit/'))

		expect(thirdParty).toEqual([])
	})

	it('keeps @rokkit/ui an OPTIONAL PEER, not a dependency', () => {
		// A prefix-only check passes here either way, which is why it needs its own assertion.
		// @rokkit/ui carries marked + dompurify + a shiki peer for MarkdownRenderer. As a flat
		// dependency those reach every consumer — including one importing only `.` for the Graph
		// canvas, which never touches Table. That is the exact cost this design rejects
		// @rokkit/chart for.
		expect(pkg.dependencies?.['@rokkit/ui']).toBeUndefined()
		expect(pkg.peerDependencies['@rokkit/ui']).toBeDefined()
		expect(pkg.peerDependenciesMeta['@rokkit/ui'].optional).toBe(true)
	})

	it('does not transitively re-introduce a markdown or sanitiser dependency', () => {
		// Guards the class, not the instance: any future @rokkit/* dependency that itself
		// carries marked/dompurify/shiki would undo the fix above silently.
		const root = join(process.cwd(), 'packages')
		const forbidden = ['marked', 'dompurify', 'shiki']

		for (const dep of Object.keys(pkg.dependencies ?? {})) {
			const name = dep.replace('@rokkit/', '')
			const manifest = JSON.parse(readFileSync(join(root, name, 'package.json'), 'utf-8'))

			for (const bad of forbidden) {
				expect(manifest.dependencies?.[bad], `${dep} pulls in ${bad}`).toBeUndefined()
			}
		}
	})

	it('exposes exactly the designed entry points', () => {
		// `./icons` is deliberately its own subpath rather than a re-export of the barrel: a
		// consumer MUST safelist the icon classes (the component picks them at runtime, so
		// UnoCSS purges them), and the config that does it is loaded by NODE, which cannot
		// parse the `.svelte` the barrel re-exports. Found by dbd wiring its safelist.
		expect(Object.keys(pkg.exports).sort()).toEqual([
			'.',
			'./icons',
			'./package.json',
			'./schema'
		])
	})
})
