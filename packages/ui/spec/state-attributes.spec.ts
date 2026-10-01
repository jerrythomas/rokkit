/* The state vocabulary is the data attributes themselves (#153): every style targets
 * `[data-selected='true']`, `[data-open='true']` and so on, and a user overrides with the same
 * selector. So each state attribute has ONE shape — present as "true", or absent — written
 * `data-x={flag || undefined}`. A component emitting `""` (or a hand-built "true") drifts from
 * what the themes target; this guard fails with the file and the line.
 */
import { describe, it, expect } from 'vitest'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const DIR = join(process.cwd(), 'packages/ui/src/components')
const STATES = ['active', 'selected', 'disabled', 'open', 'expanded', 'focused', 'checked', 'current', 'pending', 'empty']
/** `data-x={… ? <literal> : undefined}` — a state attribute built by hand rather than `flag || undefined`. */
const HAND_BUILT = new RegExp(`data-(${STATES.join('|')})=\\{[^}]*\\?\\s*(''|""|'true'|"true")\\s*:\\s*undefined\\s*\\}`)

describe('state data attributes in @rokkit/ui', () => {
	it('are written `{flag || undefined}` — present as "true", or absent', () => {
		const offenders = readdirSync(DIR)
			.filter((name) => name.endsWith('.svelte'))
			.flatMap((name) =>
				readFileSync(join(DIR, name), 'utf-8')
					.split('\n')
					.map((line, i) => [i + 1, line] as const)
					.filter(([, line]) => HAND_BUILT.test(line))
					.map(([n, line]) => `${name}:${n}: ${line.trim()}`)
			)
		expect(offenders).toEqual([])
	})
})
