<script>
	import { onMount } from 'svelte'

	export let id
	export let value
	export let label
	export let required = false
	export let readOnly = false
	export let rows = 5

	let text

	function convert(input) {
		try {
			const parsed = JSON.parse(text)
			console.log(text, parsed)
			if (parsed && typeof parsed === 'object') {
				value = parsed
			}
		} catch (err) {}
		return value
	}
	onMount(async () => {
		text = JSON.stringify(value, null, 2)
	})

	$: value = convert(text)
</script>

<div class="flex flex-col gap-1">
	<label for={id}>{label}</label>
	<textarea {id} bind:value={text} {rows} {required} {readOnly} />
</div>
