<script>
	export let id
	export let path
	export let fill = 'currentColor'
	export let stroke = 'currentColor'
	export let thickness = 0.5
	export let patternUnits = 'userSpaceOnUse'
	export let size = 10
</script>

<pattern {id} {patternUnits} width={size} height={size}>
	<rect width={size} height={size} {fill} />
	{#if path}
		<path d={path} fill="none" {stroke} stroke-width={thickness} />
	{/if}
</pattern>
