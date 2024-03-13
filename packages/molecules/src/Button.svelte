<script>
	import { Icon } from '@rokkit/atoms'
	let className = ''

	export { className as class }

	export let leftIcon = null
	export let rightIcon = null
	export let label = null
	export let type = 'submit'
	export let style = 'default'

	$: isPrimary = type === 'primary'
	$: isOutlined = style === 'outlined'
</script>

<button
	type="submit"
	class="flex flex-row items-center {className}"
	on:click
	class:is-primary={isPrimary}
	class:is-outlined={isOutlined}
>
	{#if leftIcon}
		<icon-left class="flex flex-row">
			<slot name="left">
				<Icon name={leftIcon} />
			</slot>
		</icon-left>
	{/if}
	<slot>
		{#if label}
			<p>{label}</p>
		{/if}
	</slot>
	{#if rightIcon}
		<icon-right>
			<slot name="right">
				<Icon name={rightIcon} />
			</slot>
		</icon-right>
	{/if}
</button>
