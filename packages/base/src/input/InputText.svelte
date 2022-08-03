<script>
	export let id
	export let value
	export let label
	export let required = false
	export let readOnly = false
	export let pass
	export let fail
</script>

<div class="flex flex-col">
	<label for={id}>{label}</label>
	<input
		{id}
		type="text"
		bind:value
		{required}
		{readOnly}
		{...$$restProps}
		on:change
		class:pass
		class:fail
		class:readOnly
	/>
</div>
