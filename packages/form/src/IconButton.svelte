<script>
	import { Icon } from 'rokkit/atoms'
	let className = ''

	export { className as class }
	export let leftIcon = null
	export let rightIcon = null
	export let label = null
	export let type = 'submit'
</script>

<button {type} class="flex flex-row items-center {className}" on:click>
	{#if leftIcon}
		<Icon name={leftIcon} />
	{/if}
	<p>{label}</p>
	{#if rightIcon}
		<Icon name={rightIcon} />
	{/if}
</button>
