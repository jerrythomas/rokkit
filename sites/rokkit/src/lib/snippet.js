// import { format } from 'prettier'
// import * as pluginSvelte from 'prettier-plugin-svelte'
/**
 * @param {string} name
 * @param {Object<string, any>} props
 * @param {import('./types').Snippet} page
 * @returns
 */
export function snippet(name, props, page = { refs: [] }) {
	const imports = getImports(page.refs)
	const vars = getDeclarations(props, page.defs, page.exclusions)

	const usage = `<${name} ${Object.keys(props)
		.map((k) => (k == 'class' ? `class="${props[k]}"` : `{${k}}`))
		.join(' ')} />`
	const code = `<script>\n${imports}\n\n${vars}\n</script>\n\n${usage}\n`
	return code
	// return format(code, {
	// 	semi: false,
	// 	tabWidth: 2,
	// 	useTabs: false,
	// 	parser: 'svelte',
	// 	plugins: [pluginSvelte]
	// })
}

/**
 *
 * @param {Array<import('./types').Reference>} refs
 * @returns
 */
export function getImports(refs) {
	return (refs ?? [])
		.map(
			({ source, items }) =>
				`  import ` +
				(Array.isArray(items)
					? '{ ' + items.map((x) => `${x}`).join(', ') + ' }'
					: items) +
				` from '${source}'`
		)
		.join('\n')
}

/**
 *
 * @param {Object<string, any>} props
 * @param {Object<string, string>} [defs]
 * @param {Array<string>} exclusions
 * @returns
 */
export function getDeclarations(props, defs = {}, exclusions = []) {
	defs = defs ?? {}
	exclusions = exclusions ? ['class'] : ['class', ...exclusions]

	const vars = Object.entries(props)
		.filter(([k]) => !exclusions.includes(k))
		.map(([k, v]) => (k in defs ? defs[k] : `let ${k} = ${encode(v)}`))
		.map((line) => indentBy(line))
		.join('\n')

	return vars
}

/**
 *
 * @param {*} value
 * @returns
 */
export function encode(value) {
	if (typeof value === 'string') {
		return `'${value}'`
	} else if (typeof value === 'object') {
		return JSON.stringify(value, null, 2).replaceAll('"', "'")
	}
	return value
}
/**
 *
 * @param {string} input
 * @param {number} spaces
 * @returns
 */
export function indentBy(input, spaces = 2) {
	return input
		.split('\n')
		.map((line) => ' '.repeat(spaces) + line)
		.join('\n')
}
