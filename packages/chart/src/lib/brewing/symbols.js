export const SYMBOL_ORDER = ['circle', 'square', 'triangle', 'diamond', 'plus', 'cross', 'star']

/**
 * Assigns shapes from SYMBOL_ORDER to an array of distinct values.
 * @param {unknown[]} values
 * @returns {Map<unknown, string>}
 */
export function assignSymbols(values) {
	return new Map(values.map((v, i) => [v, SYMBOL_ORDER[i % SYMBOL_ORDER.length]]))
}
