<script>
	export let left = null
	export let right = null
</script>

<field class="flex flex-row">
	{#if left}
		<square><icon class={left} /></square>
	{/if}
	<slot />
	{#if right}
		<square><icon class={right} /></square>
	{/if}
</field>
