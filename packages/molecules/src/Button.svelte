<script>
	import { Icon } from '@rokkit/atoms'
	export let type = 'submit'
	export let label
	export let icon
	export let description
</script>

<button {type} aria-label={description ?? label ?? icon}>
	{#if icon}
		<Icon {icon} />
	{/if}
	{#if label}
		<span>{label}</span>
	{/if}
</button>
