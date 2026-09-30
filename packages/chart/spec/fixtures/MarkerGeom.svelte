<script>
	/** Test double for a helper geom: echoes the props a spec geom hands it. */
	let { x, y, options, tag = 'marker' } = $props()
</script>

<g data-marker={tag} data-x={x} data-y={y} data-options={JSON.stringify(options ?? null)}></g>
