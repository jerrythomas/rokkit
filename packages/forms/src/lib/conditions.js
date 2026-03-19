/**
 * Evaluate a showWhen condition against current form data.
 * Returns true if the field should be shown (condition met or absent).
 *
 * @param {{ field: string, equals?: unknown, notEquals?: unknown } | null | undefined} condition
 * @param {Record<string, unknown>} data - Top-level form data object
 * @returns {boolean}
 */
export function evaluateCondition(condition, data) {
	if (!condition) return true
	const value = data[condition.field]
	if ('equals' in condition) return value === condition.equals
	if ('notEquals' in condition) return value !== condition.notEquals
	return true
}
