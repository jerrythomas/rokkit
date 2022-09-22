<script>
	let className = ''
	export { className as class }
	export let label
</script>

<fieldset class={className}>
	{#if label}
		<legend>{label}</legend>
	{/if}
	<div class="flex flex-col">
		<slot />
	</div>
</fieldset>
