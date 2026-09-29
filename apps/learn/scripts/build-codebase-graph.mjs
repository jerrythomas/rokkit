#!/usr/bin/env node
/**
 * Generate the codebase dataset for the graph demo, from THIS repo.
 *
 * Rokkit is a good subject for the world view because it has the shape the view is for:
 * real containment (package › folder › module) and real edges (imports between them), at a
 * size that is neither a toy nor a toy pretending otherwise — ~470 modules.
 *
 * Deliberately regex over source rather than an AST parse. A parser is a dependency and a
 * build step for a DEMO dataset; the failure mode of a regex here is a missed import, which
 * costs an edge in a picture, not a wrong answer in a product. If this ever informs anything
 * real, parse it properly.
 *
 * Output is committed so the demo needs no build-time scan and works offline. Re-run with:
 *   node apps/learn/scripts/build-codebase-graph.mjs
 */
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { join, relative, dirname, resolve } from 'node:path'

const ROOT = resolve(import.meta.dirname, '../../..')
const OUT = join(ROOT, 'apps/learn/src/lib/koan/demos/graph/codebase.json')
const SOURCE = /\.(ts|js|svelte)$/
const IGNORE = /(node_modules|dist|\.svelte-kit|\.d\.ts$)/

function walk(dir, found = []) {
	for (const entry of readdirSync(dir)) {
		const full = join(dir, entry)
		if (IGNORE.test(full)) continue
		if (statSync(full).isDirectory()) walk(full, found)
		else if (SOURCE.test(full)) found.push(full)
	}
	return found
}

/** Packages that ship source. `themes` is CSS, so it has almost none. */
const packages = readdirSync(join(ROOT, 'packages')).filter((p) =>
	existsSync(join(ROOT, 'packages', p, 'src'))
)

const nodes = []
const byFile = new Map()

for (const pkg of packages) {
	for (const file of walk(join(ROOT, 'packages', pkg, 'src'))) {
		const rel = relative(join(ROOT, 'packages', pkg, 'src'), file)
		const source = readFileSync(file, 'utf-8')
		const segments = rel.split('/')
		const name = segments[segments.length - 1]

		// `export` count stands in for "how much is declared here" — the measure the world
		// view sizes by. A re-export counts, which is right: a barrel IS surface area.
		const declarations = (source.match(/^\s*export\s/gm) ?? []).length
		// A module is "tested" when a spec names it. Summed up the tree this becomes "how many
		// of this subtree's modules have tests", which is the share worth shading by.
		const stem = name.replace(SOURCE, '')
		const tested = existsSync(join(ROOT, 'packages', pkg, 'spec', `${stem}.spec.ts`)) ||
			existsSync(join(ROOT, 'packages', pkg, 'spec', `${stem}.spec.js`)) ? 1 : 0

		const id = `packages/${pkg}/src/${rel}`
		const node = {
			id,
			label: name,
			kind: name.endsWith('.svelte') ? 'view' : 'function',
			// The package IS the group. Carrying it as well as the path means the existing
			// colour preset works unchanged — and the flat layouts can render this dataset too,
			// rather than it being world-only.
			group: pkg,
			path: ['rokkit', pkg, ...segments],
			m: { declarations, tested, files: 1, lines: source.split('\n').length }
		}
		nodes.push(node)
		byFile.set(id, node)
	}
}

/** Resolve a relative import to a file that exists, trying the usual extensions. */
function resolveRelative(fromId, spec) {
	const base = join(dirname(fromId), spec)
	for (const ext of ['', '.ts', '.js', '.svelte', '/index.ts', '/index.js']) {
		const candidate = (base + ext).replace(/\/\.\//g, '/')
		if (byFile.has(candidate)) return candidate
	}
	return undefined
}

/** A package's entry point, for a cross-package import. */
const entryOf = (pkg) =>
	[`packages/${pkg}/src/index.ts`, `packages/${pkg}/src/index.js`].find((id) => byFile.has(id))

const seen = new Set()
const edges = []

for (const node of nodes) {
	const source = readFileSync(join(ROOT, node.id), 'utf-8')
	for (const match of source.matchAll(/from\s+'([^']+)'/g)) {
		const spec = match[1]
		const target = spec.startsWith('.')
			? resolveRelative(node.id, spec)
			: spec.startsWith('@rokkit/')
				? entryOf(spec.slice('@rokkit/'.length).split('/')[0])
				: undefined

		if (!target || target === node.id) continue
		const key = `${node.id}->${target}`
		if (seen.has(key)) continue
		seen.add(key)
		edges.push({ source: node.id, target, kind: 'imports' })
	}
}

writeFileSync(OUT, JSON.stringify({ nodes, edges }, null, '\t') + '\n')
 
console.log(`codebase.json: ${nodes.length} modules, ${edges.length} imports`)
