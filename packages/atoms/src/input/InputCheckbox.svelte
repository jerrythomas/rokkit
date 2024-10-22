<script>
	import { createBubbler } from 'svelte/legacy';

	const bubble = createBubbler();
	let { value = $bindable(), ...rest } = $props();
</script>

<input type="checkbox" {...rest} bind:checked={value} onchange={bubble('change')} onfocus={bubble('focus')} onblur={bubble('blur')} />
