<script>
	import { setContext } from 'svelte'
	import { createChartPreset } from './lib/preset.js'

	let { preset = createChartPreset(), children } = $props()

	setContext('chart-preset', preset)
</script>

{@render children?.()}
