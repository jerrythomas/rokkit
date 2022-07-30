<script>
	export let label
</script>

<fieldset class="flex flex-col">
	{#if label}
		<legend>{label}</legend>
	{/if}
	<slot />
</fieldset>
