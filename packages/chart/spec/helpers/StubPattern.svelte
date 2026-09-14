<script>
	/**
	 * Minimal stand-in for a pattern component. `src/elements/DefinePatterns.svelte`
	 * expects `component` to be a Svelte component that paints one tile — but the
	 * package exports no such components any more (the live
	 * `src/patterns/DefinePatterns.svelte` uses mark DATA plus `PatternDef`
	 * instead), so the spec supplies one.
	 */
	let { size = 10, fill = 'none', stroke = 'currentColor' } = $props()
</script>

<circle data-stub-pattern cx={size / 2} cy={size / 2} r={size / 4} {fill} {stroke} />
