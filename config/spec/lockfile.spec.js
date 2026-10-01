/* The published packages pin each other through bun.lock, not package.json: `bun pm pack`
 * rewrites every `workspace:*` dependency to the version bun.lock records for that workspace.
 * v1.8.1 shipped @rokkit/ui and @rokkit/graph pinned to their 1.8.0 siblings because the bump
 * updated package.json and left bun.lock behind — graph crashed on any label. So the two must
 * agree, always; `bun run bump` refreshes the lockfile (config/bump.config.js `execute`).
 */
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = join(import.meta.dirname, '..', '..')
const read = (path) => readFileSync(join(ROOT, path), 'utf-8')

/** bun.lock is JSON with trailing commas. */
const lock = JSON.parse(read('bun.lock').replace(/,(\s*[}\]])/g, '$1'))

describe('bun.lock', () => {
	const workspaces = Object.entries(lock.workspaces).filter(([path]) => path !== '')

	it('records every workspace at the version its package.json declares', () => {
		expect(workspaces.length).toBeGreaterThan(10)
		const drift = workspaces
			.map(([path, entry]) => [path, entry.version, JSON.parse(read(`${path}/package.json`)).version])
			.filter(([, locked, declared]) => locked !== declared)
		expect(drift).toEqual([])
	})

	it('is refreshed by the bump, inside the release commit', () => {
		const config = read('config/bump.config.js')
		expect(config).toMatch(/execute:\s*'bun install --ignore-scripts'/)
		expect(config).toMatch(/all:\s*true/)
	})
})
