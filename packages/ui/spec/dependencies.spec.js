import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

// Guards the declared floor of `dompurify`. This range is republished to every
// consumer of @rokkit/ui, so a loose floor hands them a sanitizer that may be
// vulnerable even though our own lockfile is clean — downstream projects end up
// carrying an `overrides` entry to compensate (see issue #156).
//
// 3.4.13 is the lowest release that clears every dompurify advisory published
// to date; the last one to land was GHSA-55q2-fjhq-7xh7 (IN_PLACE hook removal
// leaves a detached subtree executable), patched in 3.4.13.
//
// This pins the floor against regression. It does NOT detect newly published
// advisories — `bun audit` is the signal for those, and the constant below
// moves when one lands.
const MIN_DOMPURIFY = [3, 4, 13]

// Vitest runs from the repo root; the jsdom env sets import.meta.url to a
// non-file: URL, so resolve against cwd rather than the module URL.
const PKG_DIR = join(process.cwd(), 'packages/ui')
const pkg = JSON.parse(readFileSync(join(PKG_DIR, 'package.json'), 'utf-8'))

/**
 * Parses the lowest version a caret/tilde/bare range admits into a comparable
 * tuple. Deliberately hand-rolled: `semver` is not a declared dependency of
 * this repo and a guard should not add one.
 *
 * @param {string} range - a range such as `^3.4.13`
 * @returns {Array<number>} [major, minor, patch]
 */
function floorOf(range) {
	return range.replace(/^[\^~>=]+/, '').split('.').map(Number)
}

/**
 * @param {Array<number>} a
 * @param {Array<number>} b
 * @returns {number} negative when a < b, 0 when equal, positive when a > b
 */
function compare(a, b) {
	return a[0] - b[0] || a[1] - b[1] || a[2] - b[2]
}

describe('@rokkit/ui — dependency floors', () => {
	it('declares a dompurify floor that excludes every known advisory', () => {
		const range = pkg.dependencies.dompurify

		expect(compare(floorOf(range), MIN_DOMPURIFY), `declared ${range}`).toBeGreaterThanOrEqual(0)
	})

	it('resolves an installed dompurify that satisfies the declared floor', () => {
		// Catches a lockfile left behind by a manifest edit: the range can be
		// correct while `bun install` has not been re-run.
		const installed = JSON.parse(
			readFileSync(join(process.cwd(), 'node_modules/dompurify/package.json'), 'utf-8')
		).version

		expect(compare(floorOf(installed), MIN_DOMPURIFY), `installed ${installed}`).toBeGreaterThanOrEqual(0)
	})
})

describe('workspace — dompurify resolutions', () => {
	it('locks exactly one dompurify, and it clears the floor', () => {
		// Raising only the workspace floor is not enough. bun keeps a parent's
		// previously-locked resolution rather than re-resolving it upward, so a
		// transitive parent (mermaid, or a @types stub depending on `*`) can be
		// pinned to a nested vulnerable copy while the hoisted one is clean.
		// Scanning the lockfile is what catches that; `node_modules/dompurify`
		// alone does not.
		const lock = readFileSync(join(process.cwd(), 'bun.lock'), 'utf-8')
		// The lookbehind keeps `@types/dompurify@x.y.z` — a different package —
		// out of the match.
		const resolved = [...new Set(lock.match(/(?<!@types\/)dompurify@\d+\.\d+\.\d+/g) ?? [])].map(
			(entry) => entry.replace('dompurify@', '')
		)

		// Length first: it is the assertion that fires when a nested copy appears,
		// and two copies that BOTH clear the floor would slip past the loop below.
		expect(resolved, 'one resolution keeps the sanitizer single-copy').toHaveLength(1)
		for (const version of resolved) {
			expect(compare(floorOf(version), MIN_DOMPURIFY), `locked ${version}`).toBeGreaterThanOrEqual(0)
		}
	})
})
