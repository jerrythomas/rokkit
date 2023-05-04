<script>
	// import { onMount } from 'svelte'

	export let id
	export let value
	export let label
	export let required = false
	export let readOnly = false
	export let rows = 5

	let text

	function convert() {
		try {
			const parsed = JSON.parse(text)
			if (parsed && typeof parsed === 'object') {
				value = parsed
			}
		} catch (err) {
			console.error(err)
		}
	}

	$: text = JSON.stringify(value, null, 2)
</script>

<div class="flex flex-col gap-1">
	<label for={id}>{label}</label>
	<textarea
		{id}
		bind:value={text}
		{rows}
		{required}
		{readOnly}
		on:change={convert}
	/>
</div>
