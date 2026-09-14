import { describe, it, expect } from 'vitest'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * Every component annotates its own `$props()` with a declared `<Name>Props`
 * type, and that type lives in `src/types/`.
 *
 * This is a structural guard, not a style rule. Four interfaces — ListProps,
 * MenuProps, SelectBaseProps and TreeProps — silently drifted away from their
 * components precisely because nothing connected the two: the type was
 * published, the component declared its props inline, and no checker ever
 * compared them. `ListProps` ended up advertising `item`/`groupLabel` snippets
 * and `multiselect`/`expanded`/`selected` props the component never read.
 *
 * Once a component annotates `$props()` with its own type, any drift is a
 * compile error. This test only has to keep that connection from being skipped
 * for a *new* component, which a type checker cannot notice.
 */

// Vitest runs from the repo root; the jsdom env sets import.meta.url to a
// non-file: URL, so resolve against cwd rather than the module URL — same
// reason as spec/dependencies.spec.js.
const COMPONENTS_DIR = join(process.cwd(), 'packages/ui/src/components')
const TYPES_DIR = join(process.cwd(), 'packages/ui/src/types')

const components = readdirSync(COMPONENTS_DIR)
	.filter((f) => f.endsWith('.svelte'))
	.map((f) => f.replace(/\.svelte$/, ''))

const typeSources = readdirSync(TYPES_DIR)
	.filter((f) => f.endsWith('.ts'))
	.map((f) => readFileSync(join(TYPES_DIR, f), 'utf8'))
	.join('\n')

describe('component props types', () => {
	it('finds the components to check', () => {
		// Guards the guard: a bad glob would make every case below vacuous.
		expect(components.length).toBeGreaterThan(50)
	})

	it.each(components)('%s annotates $props() with its own Props type', (name) => {
		const source = readFileSync(join(COMPONENTS_DIR, `${name}.svelte`), 'utf8')
		expect(source, `${name}.svelte should reference ${name}Props`).toContain(`${name}Props`)
	})

	it.each(components)('%s does not suppress type checking', (name) => {
		// Without this, the annotation above is decoration. Dropdown and Menu both
		// carried a `@ts-nocheck` that made their props type unenforced — and by the
		// time it was noticed the suppressions were stale anyway, costing 0 errors
		// to remove.
		const source = readFileSync(join(COMPONENTS_DIR, `${name}.svelte`), 'utf8')
		expect(source, `${name}.svelte must not use @ts-nocheck`).not.toContain('@ts-nocheck')
	})

	it.each(components)('%sProps is declared in src/types', (name) => {
		// Plain substring checks rather than a built RegExp: the declaration forms
		// are a closed set, and this keeps the assertion readable.
		const declared =
			typeSources.includes(`interface ${name}Props `) ||
			typeSources.includes(`interface ${name}Props<`) ||
			typeSources.includes(`type ${name}Props `)
		expect(
			declared,
			`${name}Props should be declared in src/types/ — an inline type can drift`
		).toBe(true)
	})
})
