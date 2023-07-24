<script>
	export let text = null
	export let type = 'error'
</script>

{#if text}
	<message class={type}>
		{text}
	</message>
{/if}
