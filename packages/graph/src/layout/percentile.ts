/**
 * The 95th-percentile cap of the present, positive values — 1 when there are none.
 *
 * Code metrics are long-tailed: one file with ten times the functions, one import pair with
 * fifty times the count. Scaling to the maximum shrinks everything else to the minimum, so a
 * channel scales to this instead and a value past it clamps (#168, #169).
 */
export function capOf(values: (number | undefined)[]): number {
	const sorted = values.filter((v): v is number => v !== undefined && v > 0).sort((a, b) => a - b)
	if (sorted.length === 0) return 1
	return sorted[Math.min(sorted.length - 1, Math.ceil(0.95 * sorted.length) - 1)]
}
