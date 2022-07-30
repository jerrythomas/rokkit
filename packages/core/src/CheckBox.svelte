<script>
	export let id
	export let value
	export let label
	export let required = false
	export let readOnly = false
</script>

<div class="flex flex-row gap-1 leading-loose items-center">
	<input {id} type="checkbox" bind:checked={value} {required} {readOnly} />
	<label for={id}>{label}</label>
</div>
