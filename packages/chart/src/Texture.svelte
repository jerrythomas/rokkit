<script lang="ts">
	type Props = {
		id?: string
		path?: string
		fill?: string
		stroke?: string
		thickness?: number
		patternUnits?: 'userSpaceOnUse' | 'objectBoundingBox'
		size?: number
	}

	let {
		id,
		path,
		fill = 'currentColor',
		stroke = 'currentColor',
		thickness = 0.5,
		patternUnits = 'userSpaceOnUse',
		size = 10
	}: Props = $props()
</script>

<pattern {id} {patternUnits} width={size} height={size}>
	<rect width={size} height={size} {fill} />
	{#if path}
		<path d={path} fill="none" {stroke} stroke-width={thickness} />
	{/if}
</pattern>
