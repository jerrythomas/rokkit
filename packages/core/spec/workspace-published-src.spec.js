import { describe, it, expect } from 'vitest'
import { readdirSync, readFileSync, existsSync } from 'node:fs'
import { join, relative } from 'node:path'

/**
 * A publishable package's `src/` holds only what ships.
 *
 * Every package publishes `src/**` (its `files` list) and `svelte-package` copies `src/` into
 * `dist/`, so a spec or fixture placed beside the code reaches every consumer's node_modules
 * twice — `@rokkit/forms` 1.8.0 shipped `lib/*.spec.js` and `lib/fixtures/*.json` that way.
 * Tests live in the package's `spec/` tree.
 *
 * Vitest runs from the repo root; resolve against cwd (see workspace-peers.spec.js).
 */

const PACKAGES_DIR = join(process.cwd(), 'packages')
const TEST_FILE = /\.(spec|test)\.[cm]?[jt]s$|\.(spec|test)\.svelte\.[jt]s$/
const TEST_DIR = new Set(['fixtures', '__tests__', '__mocks__', '__snapshots__'])

/** Every test file or test directory under `dir`, relative to the package. */
function testArtifacts(dir, pkgDir) {
	return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
		const path = join(dir, entry.name)
		if (entry.isDirectory()) {
			return TEST_DIR.has(entry.name) ? [`${relative(pkgDir, path)}/`] : testArtifacts(path, pkgDir)
		}
		return TEST_FILE.test(entry.name) ? [relative(pkgDir, path)] : []
	})
}

const packages = readdirSync(PACKAGES_DIR)
	.map((dir) => join(PACKAGES_DIR, dir))
	.filter((dir) => existsSync(join(dir, 'package.json')) && existsSync(join(dir, 'src')))
	.map((dir) => ({ dir, pkg: JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8')) }))
	.filter(({ pkg }) => !pkg.private)

describe('published src/ trees', () => {
	it('finds the publishable packages to check', () => {
		expect(packages.length).toBeGreaterThan(8)
	})

	it('recognises a test file and a fixtures directory', () => {
		// Guards the guard: a pattern that matched nothing would pass every package below.
		expect(TEST_FILE.test('fields.spec.js')).toBe(true)
		expect(TEST_FILE.test('Input.spec.svelte.js')).toBe(true)
		expect(TEST_FILE.test('builder.svelte.js')).toBe(false)
		expect(TEST_DIR.has('fixtures')).toBe(true)
	})

	it.each(packages.map(({ pkg }) => pkg.name))('%s ships no specs or fixtures in src/', (name) => {
		const { dir } = packages.find(({ pkg }) => pkg.name === name)
		const found = testArtifacts(join(dir, 'src'), dir)
		expect(found, `${name}: move these into spec/ — src/ is published`).toEqual([])
	})
})
