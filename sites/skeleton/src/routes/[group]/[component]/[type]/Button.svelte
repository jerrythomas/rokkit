<script>
	export let label
	export let icon
</script>

<button class="flex flex-row">
	<icon class={icon} />
	{#if label}
		{label}
	{/if}
</button>
