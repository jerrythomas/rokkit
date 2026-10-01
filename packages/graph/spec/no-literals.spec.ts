/* A guard: graph components carry no English of their own and no DOM event handler.
 *
 * Words come from `messages.graph`; what a press means comes from state, through the
 * `interactions` / `choices` / `canvasNavigation` actions. A literal or an inline handler that
 * creeps back in fails here, with the file and the line.
 */
import { describe, it, expect } from 'vitest'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

const SRC = join(process.cwd(), 'packages/graph/src')

function svelteFiles(dir: string): string[] {
	return readdirSync(dir).flatMap((name) => {
		const path = join(dir, name)
		if (statSync(path).isDirectory()) return svelteFiles(path)
		return name.endsWith('.svelte') ? [path] : []
	})
}

/** The markup, with comments, scripts and `{…}` expressions removed — only literal text is left. */
function markupLines(file: string): [number, string][] {
	const source = readFileSync(file, 'utf-8')
	const markup = source.replace(/<script[\s\S]*?<\/script>/, (m) => m.replace(/[^\n]/g, ''))
	return markup
		.replace(/<!--[\s\S]*?-->/g, (m) => m.replace(/[^\n]/g, ''))
		.split('\n')
		.map((line, i) => [i + 1, line.replace(/\{[^}]*\}/g, '')] as [number, string])
}

const files = svelteFiles(SRC)

describe('graph components', () => {
	it('show no literal words — every string is a message', () => {
		const offenders = files.flatMap((file) =>
			markupLines(file)
				.filter(([, line]) => />[^<>]*[A-Za-z]{2,}[^<>]*</.test(line) || /(title|aria-label|placeholder)="[^"]*[A-Za-z]{2,}/.test(line))
				.map(([n, line]) => `${file.slice(SRC.length + 1)}:${n}: ${line.trim()}`)
		)
		expect(offenders).toEqual([])
	})

	it('wire no DOM event handler — interactions go through actions', () => {
		// DOM elements only: `onchange` on a component is a callback prop, which is the API.
		const offenders = files.flatMap((file) => {
			const markup = markupLines(file).map(([, line]) => line).join('\n')
			return [...markup.matchAll(/<([a-z][\w-]*)\b([^>]*)>/g)]
				.filter(([, , attrs]) => /\son(click|dblclick|keydown|keyup|pointer\w+|wheel|change|input|mouse\w+)=/.test(attrs))
				.map((m) => `${file.slice(SRC.length + 1)}:${markup.slice(0, m.index).split('\n').length}: <${m[1]}>`)
		})
		expect(offenders).toEqual([])
	})
})
