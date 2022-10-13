<script>
	let className = ''

	export { className as class }
	export let leftIcon = null
	export let rightIcon = null
	export let label = null
	export let type = 'submit'
	// export let tabindex = 0
</script>

<button {type} class="flex flex-row items-center {className}" on:click>
	{#if leftIcon}
		<icon-left>
			<icon class={leftIcon} />
		</icon-left>
	{/if}
	<p>{label}</p>
	{#if rightIcon}
		<icon-right>
			<icon class={rightIcon} />
		</icon-right>
	{/if}
</button>
