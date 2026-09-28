/* Splitting a SQL type into its base and its size, for the two-column display in the
   entity detail panel. Ported from dbd's EntityView module block.

   Parsing, not formatting choice, so it lives here with its own tests rather than inline
   in the template — the component stays free of computation. */

const ARG = /\(([^)]*)\)/

/** `varchar(255)` -> `varchar`, `text[]` -> `text`. */
export function baseType(type: string): string {
	return type.replace(ARG, '').replace(/\[\]$/, '')
}

/** `varchar(255)` -> `255`, `text[]` -> `[]`, `uuid` -> an em dash. */
export function typeSize(type: string): string {
	const matched = type.match(ARG)
	if (matched) return matched[1]
	if (type.endsWith('[]')) return '[]'
	return '—'
}
