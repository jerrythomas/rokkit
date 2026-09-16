import { describe, it, expect } from 'vitest'
import { readdirSync, readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

/**
 * Framework singletons must be peer dependencies, never hard ones.
 *
 * A library that lists svelte (or unocss) under `dependencies` lets the package
 * manager install a second copy beside the consumer's whenever their version
 * misses our range. Two svelte runtimes do not share context or lifecycle
 * registries; two unocss engines produce preset objects the other cannot
 * consume. Both were shipped in 1.5.0 and demonstrated against real installs —
 * see docs/backlog/2026-09-16-svelte-as-hard-dependency.md.
 *
 * Nothing in the type system or the publish pipeline catches this: the manifest
 * is valid either way, and it only misbehaves in a consumer's tree.
 *
 * Vitest runs from the repo root; resolve against cwd rather than the module
 * URL (same reason as packages/ui/spec/dependencies.spec.js).
 */

const PACKAGES_DIR = join(process.cwd(), 'packages')

/** Packages whose identity matters process-wide — one copy or nothing works. */
const SINGLETONS = ['svelte', 'unocss', '@sveltejs/kit']

const manifests = readdirSync(PACKAGES_DIR)
	.map((dir) => join(PACKAGES_DIR, dir, 'package.json'))
	.filter((path) => existsSync(path))
	.map((path) => JSON.parse(readFileSync(path, 'utf8')))
	.filter((pkg) => !pkg.private)

describe('workspace dependency shape', () => {
	it('finds the publishable packages to check', () => {
		// Guards the guard: a bad path would make every case below vacuous.
		expect(manifests.length).toBeGreaterThan(8)
	})

	it.each(manifests.map((p) => p.name))('%s declares no framework singleton as a hard dep', (name) => {
		const pkg = manifests.find((p) => p.name === name)
		const offenders = SINGLETONS.filter((s) => pkg.dependencies?.[s])
		expect(
			offenders,
			`${name} must take ${offenders.join(', ')} as a peerDependency — a hard dep ` +
				`installs a second copy beside the consumer's`
		).toEqual([])
	})

	it.each(manifests.map((p) => p.name))('%s pins the singletons it peers on', (name) => {
		const pkg = manifests.find((p) => p.name === name)
		for (const singleton of SINGLETONS) {
			if (!pkg.peerDependencies?.[singleton]) continue
			// Workspace hoisting means the root devDependency already satisfies this at
			// build time, so a missing one is not breakage — it is an unpinned version.
			// Declaring it states which version the package is actually exercised
			// against, and keeps the package self-contained if it is ever extracted.
			expect(
				pkg.devDependencies?.[singleton],
				`${name} peers on ${singleton} without a devDependency — it builds today ` +
					`only via root hoisting, and nothing records the version it is tested against`
			).toBeTruthy()
		}
	})
})
