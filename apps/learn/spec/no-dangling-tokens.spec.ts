/* Custom properties that do not exist in the design system read as nothing: a `var()` with no
 * definition and no fallback silently resolves to the inherited value, so a gap, a size or a
 * weight just vanishes. These are the names that have been reached for and never existed (or,
 * like the --text-* scale, were removed in #152): spacing is --density-spacing-*, a heading
 * level is [data-heading], and a weight is a number.
 */
import { describe, it, expect } from 'vitest'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const ROOT = join(process.cwd())
const SCAN = ['apps/learn/src', 'packages/ui/src', 'packages/graph/src', 'packages/chart/src', 'packages/forms/src', 'packages/app/src', 'packages/blocks/src', 'packages/themes/src']
const DANGLING = /var\(--(space-\d+|text-(xs|sm|md|lg|xl|base|h[1-6]|body|small)|leading-(h[1-6]|body|small)|weight-(h[1-6]|body|small)|font-weight-[a-z]+)\b/

function files(dir: string): string[] {
	return readdirSync(dir).flatMap((name) => {
		const path = join(dir, name)
		if (statSync(path).isDirectory()) return files(path)
		return /\.(svelte|css)$/.test(name) ? [path] : []
	})
}

describe('custom properties', () => {
	it('reads none that the design system does not define', () => {
		const offenders = SCAN.flatMap((dir) => files(join(ROOT, dir))).flatMap((file) =>
			readFileSync(file, 'utf-8')
				.split('\n')
				.map((line, i) => [i + 1, line] as const)
				.filter(([, line]) => DANGLING.test(line))
				.map(([n, line]) => `${relative(ROOT, file)}:${n}: ${line.trim()}`)
		)
		expect(offenders).toEqual([])
	})
})
