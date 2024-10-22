<script>
	import { createBubbler } from 'svelte/legacy';

	const bubble = createBubbler();
	import { defaultFields, getValue, getText } from '@rokkit/core'

	let { value = $bindable(), fields = defaultFields, options = [], ...rest } = $props();
</script>

<select bind:value {...rest} onchange={bubble('change')} onfocus={bubble('focus')} onblur={bubble('blur')}>
	{#each options as option}
		<option value={getValue(option, fields)}>{getText(option, fields)}</option>
	{/each}
</select>
