#!/usr/bin/env node
/**
 * pack-repoint — publish-time manifest transform (see GitHub issue #141).
 *
 * Rokkit ships Svelte source through the `svelte`/`default` export conditions so the
 * monorepo + apps/learn get zero-build dev (the checked-in manifest points at `./src`).
 * But raw `.svelte.ts` runes modules carry TypeScript that Vite's dependency optimizer
 * compiles via Svelte's `compileModule` WITHOUT stripping TS, crashing external `vite dev`
 * on the first `export type`. `svelte-package` already emits a preprocessed `dist/`
 * (TS-stripped `.svelte` components + compiled `.svelte.js` runes modules + `.d.ts`);
 * this rewrites the published manifest to serve that dist instead of raw `./src`.
 *
 * `bun pm pack` / `bun publish` ignore `publishConfig` field overrides, so we transform
 * package.json in place: `prepublishOnly` repoints (`./src/*.ts` → `./dist/*.js`) right
 * after the build, the pack picks up the dist-pointing manifest, and `postpublish` restores
 * the original from a backup (CI is ephemeral, so an un-restored run there is harmless).
 *
 * Usage (from a package directory):
 *   node ../../config/pack-repoint.mjs            # repoint src → dist (writes a backup)
 *   node ../../config/pack-repoint.mjs --restore  # restore the original manifest
 */
import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const cwd = process.cwd()
const pkgPath = resolve(cwd, 'package.json')
const backupPath = resolve(cwd, 'package.json.pack-backup')

if (process.argv.includes('--restore')) {
	if (existsSync(backupPath)) {
		writeFileSync(pkgPath, readFileSync(backupPath))
		rmSync(backupPath)
		console.log('[pack-repoint] restored src-pointing package.json')
	}
	process.exit(0)
}

/** Map a `./src/...` (or bare `src/...`) path to its compiled `./dist/...` equivalent. */
function toDist(value, isTypes) {
	if (typeof value !== 'string') return value
	const match = value.match(/^\.?\/?src(\/.*)?$/)
	if (!match) return value
	const rest = match[1] ?? ''
	const out = `./dist${rest}`
	return isTypes ? out.replace(/\.ts$/, '.d.ts') : out.replace(/\.ts$/, '.js')
}

/** Recurse the `exports` tree, remapping string targets. A `types` condition key emits `.d.ts`. */
function walk(node, isTypes) {
	if (typeof node === 'string') return toDist(node, isTypes)
	if (node && typeof node === 'object') {
		return Object.fromEntries(Object.entries(node).map(([key, value]) => [key, walk(value, key === 'types')]))
	}
	return node
}

const original = readFileSync(pkgPath, 'utf8')
// Guard idempotency: never overwrite an existing backup (toDist/files are no-ops on dist paths).
if (!existsSync(backupPath)) writeFileSync(backupPath, original)

const pkg = JSON.parse(original)

for (const field of ['svelte', 'types', 'main', 'module']) {
	if (typeof pkg[field] === 'string') pkg[field] = toDist(pkg[field], field === 'types')
}
if (pkg.exports) pkg.exports = walk(pkg.exports, false)

const keepFiles = (pkg.files ?? []).filter((entry) => {
	const normalized = entry.replace(/^\.\//, '')
	return !(normalized === 'src' || normalized.startsWith('src/') || normalized === 'dist' || normalized.startsWith('dist/'))
})
pkg.files = ['dist', ...keepFiles]

writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`)
console.log(`[pack-repoint] repointed ${pkg.name}: exports/svelte/files → dist`)
