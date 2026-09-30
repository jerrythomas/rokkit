#!/usr/bin/env node
/**
 * Generate the architecture-metrics dataset for the chart demo's Architecture recipes, from
 * THIS repo — Robert Martin's main sequence, hotspots, complexity × coverage, fan-in × fan-out
 * and the god-module region all plot real numbers about rokkit, not invented ones.
 *
 * Two tables:
 *
 * - `components` — one row per COMPONENT, Martin's unit: a top-level folder under a package's
 *   `src/` (`chart/geoms`, `ui/components`), or the package root for files sitting directly
 *   in `src/`. Instability and abstractness are defined per component, not per file; at file
 *   level most points land exactly on (0,0) or (1,0) and the picture is noise.
 * - `modules` — one row per source file, for the charts whose unit IS the file.
 * - `imports` — component → component, with the number of file-level imports behind it. The
 *   dependency matrix reads these.
 * - `cochange` — component pairs that change in the SAME commit, counted over history, and
 *   whether an import joins them. A pair that changes together with no import between them is
 *   hidden coupling — the edge the graph demo overlays without letting it shape the layout.
 *
 * Deliberately regex over source, like `build-codebase-graph.mjs` beside it: a missed import
 * or a miscounted branch costs a dot in a demo, not a wrong answer in a product. If this ever
 * informs a real decision, parse it properly.
 *
 * Coverage comes from `coverage/coverage-final.json`, so run `bun run coverage` first; without
 * it `coverage` is null and the coverage recipe says so rather than plotting zeros.
 *
 * Output is committed so the demo needs no scan and works offline. Re-run with:
 *   bun run coverage && node apps/learn/scripts/build-architecture-metrics.mjs
 */
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { join, relative, dirname, resolve } from 'node:path'
import { execFileSync } from 'node:child_process'

const ROOT = resolve(import.meta.dirname, '../../..')
const OUT = join(ROOT, 'apps/learn/src/lib/koan/demos/chart/architecture.json')
const COVERAGE = join(ROOT, 'coverage/coverage-final.json')
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

const round = (n, places = 3) => Math.round(n * 10 ** places) / 10 ** places

/* ─── per-file measures ──────────────────────────────────────────────────── */

/**
 * Decision points + 1 — an approximation of cyclomatic complexity. Counts branching keywords
 * and short-circuit operators; misses ternaries (a `?` is too ambiguous with optional
 * chaining and TS optional members to count by regex).
 */
const complexityOf = (source) =>
	1 + (source.match(/\b(if|for|while|case|catch)\b|&&|\|\||\?\?/g) ?? []).length

/**
 * Exported declarations, split into abstract and concrete. A type, an interface, an abstract
 * class or a JSDoc `@typedef` is abstract — a contract with no behaviour; everything else a
 * module exports is concrete. A `.svelte` file is one concrete component.
 */
function declarationsOf(name, source) {
	if (name.endsWith('.svelte')) return { total: 1, abstract: 0 }
	const abstract =
		(source.match(/^\s*export\s+(declare\s+)?(type|interface|abstract\s+class)\b/gm) ?? []).length +
		(source.match(/@typedef\b/g) ?? []).length
	const exported = (source.match(/^\s*export\s/gm) ?? []).length
	const typedefs = (source.match(/@typedef\b/g) ?? []).length
	return { total: exported + typedefs, abstract }
}

/** Commits touching each file, over the whole history of the repo. */
function churnByFile() {
	const log = execFileSync('git', ['log', '--format=', '--name-only', '--', 'packages'], {
		cwd: ROOT,
		encoding: 'utf-8',
		maxBuffer: 256 * 1024 * 1024
	})
	const counts = new Map()
	for (const line of log.split('\n')) {
		if (line) counts.set(line, (counts.get(line) ?? 0) + 1)
	}
	return counts
}

/**
 * Files changed by each commit. Formatted with a marker line per commit so the name lists can
 * be split without guessing where one commit ends.
 */
function commits() {
	const log = execFileSync('git', ['log', '--format=tformat:@@commit', '--name-only', '--', 'packages'], {
		cwd: ROOT,
		encoding: 'utf-8',
		maxBuffer: 256 * 1024 * 1024
	})
	return log
		.split('@@commit')
		.map((block) => block.split('\n').filter(Boolean))
		.filter((files) => files.length > 0)
}

/** Statement coverage per repo-relative file, or an empty map when coverage has not run. */
function coverageByFile() {
	if (!existsSync(COVERAGE)) return new Map()
	const raw = JSON.parse(readFileSync(COVERAGE, 'utf-8'))
	const out = new Map()
	for (const [abs, entry] of Object.entries(raw)) {
		const hits = Object.values(entry.s ?? {})
		if (hits.length === 0) continue
		out.set(relative(ROOT, abs), hits.filter((h) => h > 0).length / hits.length)
	}
	return out
}

/* ─── modules and imports ────────────────────────────────────────────────── */

const packages = readdirSync(join(ROOT, 'packages')).filter((p) =>
	existsSync(join(ROOT, 'packages', p, 'src'))
)
const churn = churnByFile()
const coverage = coverageByFile()

const modules = []
const byId = new Map()

for (const pkg of packages) {
	const src = join(ROOT, 'packages', pkg, 'src')
	for (const file of walk(src)) {
		const rel = relative(src, file)
		const segments = rel.split('/')
		const name = segments[segments.length - 1]
		const source = readFileSync(file, 'utf-8')
		const id = `packages/${pkg}/src/${rel}`
		const decl = declarationsOf(name, source)
		const row = {
			id,
			label: name,
			package: pkg,
			component: segments.length > 1 ? `${pkg}/${segments[0]}` : pkg,
			loc: source.split('\n').length,
			complexity: complexityOf(source),
			churn: churn.get(id) ?? 0,
			coverage: coverage.has(id) ? round(coverage.get(id)) : null,
			declarations: decl.total,
			abstract: decl.abstract,
			fanIn: 0,
			fanOut: 0,
			source
		}
		modules.push(row)
		byId.set(id, row)
	}
}

function resolveRelative(fromId, spec) {
	const base = join(dirname(fromId), spec)
	for (const ext of ['', '.ts', '.js', '.svelte', '/index.ts', '/index.js']) {
		const candidate = (base + ext).replace(/\/\.\//g, '/')
		if (byId.has(candidate)) return candidate
	}
	return undefined
}

const entryOf = (pkg) =>
	[`packages/${pkg}/src/index.ts`, `packages/${pkg}/src/index.js`].find((id) => byId.has(id))

/** Resolved in-repo imports, de-duplicated per (importer, imported) pair. */
const imports = []
const seen = new Set()
for (const row of modules) {
	for (const match of row.source.matchAll(/from\s+'([^']+)'/g)) {
		const spec = match[1]
		const target = spec.startsWith('.')
			? resolveRelative(row.id, spec)
			: spec.startsWith('@rokkit/')
				? entryOf(spec.slice('@rokkit/'.length).split('/')[0])
				: undefined
		if (!target || target === row.id) continue
		const key = `${row.id}->${target}`
		if (seen.has(key)) continue
		seen.add(key)
		imports.push([row.id, target])
		row.fanOut++
		byId.get(target).fanIn++
	}
}

/* ─── components: Martin's metrics ───────────────────────────────────────── */

const components = new Map()
for (const row of modules) {
	const c = components.get(row.component) ?? {
		component: row.component,
		package: row.package,
		files: 0,
		loc: 0,
		churn: 0,
		declarations: 0,
		abstract: 0,
		dependents: new Set(),
		dependers: new Set()
	}
	c.files++
	c.loc += row.loc
	c.churn += row.churn
	c.declarations += row.declarations
	c.abstract += row.abstract
	components.set(row.component, c)
}

// Ca: files OUTSIDE a component that import something inside it.
// Ce: files INSIDE a component that import something outside it.
for (const [from, to] of imports) {
	const a = byId.get(from).component
	const b = byId.get(to).component
	if (a === b) continue
	components.get(b).dependents.add(from)
	components.get(a).dependers.add(from)
}

const componentRows = [...components.values()]
	.map((c) => {
		const ca = c.dependents.size
		const ce = c.dependers.size
		const instability = ca + ce === 0 ? null : ce / (ca + ce)
		const abstractness = c.declarations === 0 ? 0 : c.abstract / c.declarations
		return {
			component: c.component,
			package: c.package,
			files: c.files,
			loc: c.loc,
			churn: c.churn,
			ca,
			ce,
			instability: instability === null ? null : round(instability),
			abstractness: round(abstractness),
			distance: instability === null ? null : round(Math.abs(abstractness + instability - 1))
		}
	})
	// A component nothing touches and that touches nothing has no instability to plot.
	.filter((c) => c.instability !== null)
	.sort((a, b) => a.component.localeCompare(b.component))

/* ─── component imports and co-change ───────────────────────────────────── */

const importCounts = new Map()
for (const [from, to] of imports) {
	const a = byId.get(from).component
	const b = byId.get(to).component
	if (a === b) continue
	const key = `${a}\t${b}`
	importCounts.set(key, (importCounts.get(key) ?? 0) + 1)
}
const importRows = [...importCounts]
	.map(([key, count]) => {
		const [source, target] = key.split('\t')
		return { source, target, count }
	})
	.sort((x, y) => x.source.localeCompare(y.source) || x.target.localeCompare(y.target))

const imported = (a, b) => importCounts.has(`${a}\t${b}`) || importCounts.has(`${b}\t${a}`)
const known = new Set(componentRows.map((c) => c.component))

// A commit that touches half the repo (a rename, a formatter run) couples everything with
// everything and says nothing, so only focused commits count.
const MAX_COMPONENTS_PER_COMMIT = 6
const pairCounts = new Map()
for (const files of commits()) {
	const touched = [
		...new Set(files.map((f) => byId.get(f)?.component).filter((c) => c && known.has(c)))
	].sort()
	if (touched.length < 2 || touched.length > MAX_COMPONENTS_PER_COMMIT) continue
	for (let i = 0; i < touched.length; i++) {
		for (let j = i + 1; j < touched.length; j++) {
			const key = `${touched[i]}\t${touched[j]}`
			pairCounts.set(key, (pairCounts.get(key) ?? 0) + 1)
		}
	}
}
// The strongest pairs only — a demo overlay of every pair that ever co-occurred is a hairball.
const MIN_COCHANGES = 3
const cochangeRows = [...pairCounts]
	.filter(([, count]) => count >= MIN_COCHANGES)
	.map(([key, count]) => {
		const [source, target] = key.split('\t')
		return { source, target, count, imported: imported(source, target) }
	})
	.sort((x, y) => y.count - x.count || x.source.localeCompare(y.source))

const moduleRows = modules
	// The source text was only needed to count imports; it is not part of the dataset.
	.map((row) => Object.fromEntries(Object.entries(row).filter(([key]) => key !== 'source')))
	.sort((a, b) => a.id.localeCompare(b.id))

writeFileSync(
	OUT,
	JSON.stringify(
		{
			generated: 'node apps/learn/scripts/build-architecture-metrics.mjs',
			coverage: coverage.size > 0,
			components: componentRows,
			modules: moduleRows,
			imports: importRows,
			cochange: cochangeRows
		},
		null,
		'\t'
	) + '\n'
)

console.log(
	`architecture.json: ${componentRows.length} components, ${moduleRows.length} modules, ` +
		`${importRows.length} component imports, ${cochangeRows.length} co-change pairs ` +
		`(${cochangeRows.filter((r) => !r.imported).length} with no import), ` +
		`${imports.length} imports, coverage ${coverage.size > 0 ? 'included' : 'ABSENT — run bun run coverage'}`
)
