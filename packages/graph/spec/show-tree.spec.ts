import { it } from 'vitest'
import { writeFileSync } from 'node:fs'
import { normalizeGraph } from '../src/model/normalize.js'
import { buildTree } from '../src/model/tree.js'
import type { TreeNode } from '../src/model/tree.js'
import { CALL_FIELDS, delimitedPath, nestedPath, measured } from './fixtures.js'

const render = (root: TreeNode, lines: string[] = [], prefix = '', last = true) => {
	const kind = root.children.length ? (root.node ? 'claimed' : 'synth  ') : 'leaf   '
	const head = root.depth === 0 ? 'ROOT' : `${prefix}${last ? '└─ ' : '├─ '}${root.label}`
	lines.push(`${head.padEnd(30)} ${kind}  value=${String(root.value).padStart(5)}  d=${root.depth}`)
	const next = root.depth === 0 ? '' : prefix + (last ? '   ' : '│  ')
	root.children.forEach((c, i) => render(c, lines, next, i === root.children.length - 1))
	return lines
}

it('show', () => {
	const F = { ...CALL_FIELDS, path: 'path', note: 'note', measures: 'm' }
	const out: string[] = []

	out.push('=== nestedPath (array form) · measure = weight ===')
	out.push(...render(buildTree(normalizeGraph(nestedPath.nodes, nestedPath.edges, F))))

	out.push('', "=== delimitedPath (string form, path: 'dbd/core/lexer/parse') ===")
	out.push(...render(buildTree(normalizeGraph(delimitedPath.nodes, delimitedPath.edges, F))))

	const m = normalizeGraph(measured.nodes, measured.edges, F)
	out.push('', '=== measured · measure = declarations ===')
	out.push(...render(buildTree(m, { measure: 'declarations' })))

	out.push('', '=== same tree · measure = unresolved (0..1 share) ===')
	out.push(...render(buildTree(m, { measure: 'unresolved' })))

	writeFileSync('/tmp/tree.txt', out.join('\n'))
})
