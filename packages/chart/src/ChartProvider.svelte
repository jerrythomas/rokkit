<script lang="ts">
	import { setContext } from 'svelte'
	import type { Snippet } from 'svelte'
	import { createChartPreset } from './lib/preset.js'

	type Preset = ReturnType<typeof createChartPreset>

	type Props = {
		preset?: Preset
		children?: Snippet
	}

	let { preset = createChartPreset(), children }: Props = $props()

	setContext('chart-preset', { get current() { return preset } })
</script>

{@render children?.()}
