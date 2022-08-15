<script>
	export let leftIcon = null
	export let rightIcon = null
	export let label = null
	export let type = 'default'
</script>

<button class="flex flex-row items-center {type}" on:click>
	{#if leftIcon}
		<span class="flex-square h-full icon-left">
			<icon class={leftIcon} />
		</span>
	{/if}
	<p>{label}</p>
	{#if rightIcon}
		<span class="flex-square h-full icon-right">
			<icon class={rightIcon} />
		</span>
	{/if}
</button>
