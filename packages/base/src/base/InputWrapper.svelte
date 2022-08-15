<script>
	import { inputs } from './index'

	export let value
	export let type = 'text'
</script>

<svelte:component this={inputs[type]} bind:value {...$$restProps} />
