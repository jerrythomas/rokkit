<script>
	export let id
	// export let fill
	export let path
	// export let contrast
	export let thickness = 0.5
	export let patternUnits = 'userSpaceOnUse'
	export let size = 10
</script>

<pattern id="p-{id}" {patternUnits} width={size} height={size}>
	{#if path}
		<path d={path} fill="none" stroke="white" stroke-width={thickness} />
		<!-- {:else}
	<rect width={size} height={size} {fill} /> -->
	{/if}
</pattern>
<mask {id}>
	<rect x="0" y="0" width="100%" height="100%" fill="url(#p-{id})" />
</mask>
