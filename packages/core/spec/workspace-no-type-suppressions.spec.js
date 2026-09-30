import { describe, it, expect } from 'vitest'
import { readdirSync, readFileSync, existsSync } from 'node:fs'
import { join, relative } from 'node:path'

/**
 * No TypeScript file under a package's src/ switches the checker off.
 *
 * `@ts-nocheck` hid real defects here: a type import preset-mini 66 had removed, and the
 * icons config's settings keys being registered as icon collections. A suppression makes a
 * file's types decoration — they stop being checked — so it is banned at the workspace level
 * (the ui props spec bans it in .svelte files). Vitest runs from the repo root; see
 * workspace-peers.spec.js.
 */

const PACKAGES_DIR = join(process.cwd(), 'packages')
const SUPPRESSION = /@ts-(nocheck|ignore|expect-error)\b/
const isTs = (name) => /\.(ts|mts|cts)$/.test(name) && !name.endsWith('.d.ts')

function tsFiles(dir) {
	return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
		const path = join(dir, entry.name)
		if (entry.isDirectory()) return tsFiles(path)
		return isTs(entry.name) ? [path] : []
	})
}

const packages = readdirSync(PACKAGES_DIR)
	.map((dir) => join(PACKAGES_DIR, dir, 'src'))
	.filter((src) => existsSync(src))

describe('type suppressions', () => {
	it('finds TypeScript sources to check', () => {
		expect(packages.flatMap(tsFiles).length).toBeGreaterThan(20)
	})

	it('recognises each suppression form', () => {
		expect(SUPPRESSION.test('// @ts-nocheck')).toBe(true)
		expect(SUPPRESSION.test('// @ts-ignore')).toBe(true)
		expect(SUPPRESSION.test('// @ts-expect-error — reason')).toBe(true)
		expect(SUPPRESSION.test('// ts-nocheck-free')).toBe(false)
	})

	it('no package src/ TypeScript file suppresses the checker', () => {
		const offenders = packages
			.flatMap(tsFiles)
			.filter((file) => SUPPRESSION.test(readFileSync(file, 'utf8')))
			.map((file) => relative(process.cwd(), file))
		expect(offenders).toEqual([])
	})
})
