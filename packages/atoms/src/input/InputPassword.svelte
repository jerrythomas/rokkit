<script>
	import { createBubbler } from 'svelte/legacy';

	const bubble = createBubbler();
	let { value = $bindable(), ...rest } = $props();
</script>

<input bind:value type="password" {...rest} onchange={bubble('change')} onfocus={bubble('focus')} onblur={bubble('blur')} />
