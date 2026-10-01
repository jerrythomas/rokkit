#!/usr/bin/env node
/**
 * check-pins — refuse to publish a tarball whose @rokkit siblings are pinned to another release.
 *
 * `bun pm pack` rewrites `workspace:*` from bun.lock; v1.8.1 shipped @rokkit/ui and
 * @rokkit/graph pinned to their 1.8.0 siblings because the lockfile lagged the bump. A
 * dist-tag (`latest`) is left alone; only an explicit version that is not this release fails.
 *
 *   node config/check-pins.mjs <package.tgz>
 */
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const SECTIONS = ['dependencies', 'peerDependencies', 'optionalDependencies']

/** `@rokkit/x@range` for every sibling pinned to a version other than `manifest.version`. */
export function stalePins(manifest) {
	return SECTIONS.flatMap((section) => Object.entries(manifest[section] ?? {}))
		.filter(([name, range]) => name.startsWith('@rokkit/') && /\d/.test(range) && range !== manifest.version)
		.map(([name, range]) => `${name}@${range}`)
}

function main(tarball) {
	const manifest = JSON.parse(execFileSync('tar', ['-xOzf', tarball, 'package/package.json'], { encoding: 'utf-8' }))
	const stale = stalePins(manifest)
	if (stale.length === 0) return
	console.error(`::error::${manifest.name}@${manifest.version} pins siblings to another release: ${stale.join(', ')}`)
	process.exit(1)
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main(process.argv[2])
