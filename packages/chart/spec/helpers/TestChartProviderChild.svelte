<script>
	import { getContext } from 'svelte'
	const presetCtx = getContext('chart-preset')
</script>

<span data-testid="preset-consumer" data-preset-set={String(presetCtx !== null && presetCtx !== undefined)}></span>
