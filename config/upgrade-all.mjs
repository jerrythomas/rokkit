#!/usr/bin/env node
/**
 * upgrade-all — move every package's dependencies to their latest release, except the holds.
 *
 * `bun update --latest` ignores a range's caret, which is the point of it and also the trap:
 * it will happily cross a major the toolchain cannot run on. Each package is updated by NAME,
 * leaving out the held ones, so a hold is a decision written down here rather than a caret
 * someone has to remember not to trust.
 *
 *   node config/upgrade-all.mjs      # what `bun run upgrade:all` runs
 */
import { readdirSync, readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

/**
 * Packages not to move to latest, and why. Lift a hold only together with the change its
 * reason names.
 */
export const HOLDS = {
	typescript:
		'svelte-check 4.x refuses TypeScript 7 at startup; it needs TS 6 as `typescript` plus TS 7 ' +
		'aliased as `@typescript/native`, and `--tsgo` on every check script (#156 §4).'
}

/** The dependency sets an upgrade may move. Peers are a promise to consumers, not a pin. */
const SECTIONS = ['dependencies', 'devDependencies', 'optionalDependencies']

/** Every dependency of `manifest` to update to latest: not a workspace link, not held. */
export function upgradeTargets(manifest, holds = HOLDS) {
	return SECTIONS.flatMap((section) => Object.entries(manifest[section] ?? {}))
		.filter(([name, range]) => !String(range).startsWith('workspace:') && !(name in holds))
		.map(([name]) => name)
}

function upgradePackage(dir) {
	const manifestPath = join(dir, 'package.json')
	if (!existsSync(manifestPath)) return
	const targets = upgradeTargets(JSON.parse(readFileSync(manifestPath, 'utf-8')))
	if (targets.length === 0) return
	console.log(`→ ${dir}: ${targets.length} dependencies`)
	const { status } = spawnSync('bun', ['update', '--latest', ...targets], { cwd: dir, stdio: 'inherit' })
	if (status !== 0) throw new Error(`bun update failed in ${dir} (exit ${status})`)
}

function main() {
	const root = join(fileURLToPath(new URL('.', import.meta.url)), '..', 'packages')
	for (const [name, why] of Object.entries(HOLDS)) console.log(`hold ${name}: ${why}`)
	for (const entry of readdirSync(root, { withFileTypes: true })) {
		if (entry.isDirectory()) upgradePackage(join(root, entry.name))
	}
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main()
