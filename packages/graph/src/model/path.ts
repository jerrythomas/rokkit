/**
 * Reads a dotted field path off a source row.
 *
 * Field maps name object paths only. Arrays are rejected on purpose: a map like
 * `rows.0.name` would break the moment the data reorders, so it is better to
 * return undefined than to make it appear to work.
 *
 * Only OWN properties are read. The map is consumer-supplied and the rows are
 * consumer data, so a path naming `constructor` or `toString` must read as
 * absent — walking the prototype chain would resolve `constructor.name` to
 * 'Object' and hand a layout a label no row actually carries.
 */
export function readPath(row: unknown, path: string): unknown {
	let current = row

	for (const segment of path.split('.')) {
		if (current === null || typeof current !== 'object' || Array.isArray(current)) return undefined
		if (!Object.hasOwn(current, segment)) return undefined
		current = (current as Record<string, unknown>)[segment]
	}

	return current
}
