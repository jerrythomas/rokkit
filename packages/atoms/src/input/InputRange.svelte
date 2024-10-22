<script>
	import { createBubbler } from 'svelte/legacy';

	const bubble = createBubbler();
	let {
		value = $bindable(),
		min = undefined,
		max = undefined,
		list = undefined,
		...rest
	} = $props();
</script>

<input bind:value type="range" {...rest} {min} {max} {list} onchange={bubble('change')} onfocus={bubble('focus')} onblur={bubble('blur')} />
