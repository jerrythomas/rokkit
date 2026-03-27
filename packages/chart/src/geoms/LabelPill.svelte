<script>
	/** @type {{ x: number, y: number, text: string, color?: string }} */
	let { x, y, text, color = '#333' } = $props()

	const w = $derived(Math.max(36, String(text).length * 7 + 12))
</script>

<g transform="translate({x},{y})" pointer-events="none" data-plot-element="label">
	<rect x={-w / 2} y="-9" width={w} height="18" rx="4" fill="white" fill-opacity="0.82" />
	<text
		text-anchor="middle"
		dominant-baseline="central"
		font-size="11"
		font-weight="600"
		fill={color}>{text}</text
	>
</g>
