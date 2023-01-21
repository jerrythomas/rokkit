/**
 * @typedef Reference
 * @property {string} source
 * @property {Array<string>|string} items
 */

/**
 * @typedef ComponentMetadata
 * @property {object} props
 * @property {Array<Reference>} refs
 * @property {Object<string, string>} [declarations]
 */

/**
 * @param {string} name
 * @param {ComponentMetadata} page
 * @returns
 */
export function snippet(name, page) {
	const { refs, props, declarations = {} } = page
	const vars = Object.entries(props)
		.map(([k, v]) =>
			k in declarations
				? declarations[k]
				: `let ${k} = ${JSON.stringify(v, null, 2).replaceAll('"', "'")}`
		)
		.map((line) => indentBy(line))
		.join('\n')

	const imports = refs
		.map(
			({ source, items }) =>
				`  import ` +
				(Array.isArray(items)
					? '{ ' + items.map((x) => `${x}`).join(', ') + ' }'
					: items) +
				` from '${source}'`
		)
		.join('\n')
	const usage = `<${name} ${Object.keys(props)
		.map((k) => `{${k}}`)
		.join(' ')} />`
	return `<script>\n${imports}\n\n${vars}\n</script>\n\n${usage}\n`
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
