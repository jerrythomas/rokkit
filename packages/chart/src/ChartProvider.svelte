<script>
	import { setContext } from 'svelte'
	import { createChartPreset } from './lib/preset.js'

	let { preset = createChartPreset(), children } = $props()

	setContext('chart-preset', { get current() { return preset } })
</script>

{@render children?.()}
