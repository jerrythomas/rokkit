<script>
	import { InputField, IconButton } from '@svelte-spice/form'

	/** @type {string} */
	export let name
	/** @type {string} */
	export let label = 'Continue with ' + name
	/** @type {string} */
	export let authUrl
</script>

<form method="post" action={authUrl} class="flex flex-row w-full auth {name}">
	<input type="hidden" name="name" value={name} />
	{#if name === 'magic'}
		{@const icons = { left: 'logo-magic' }}
		<InputField type="email" name="email" placeholder={label} {icons} />
	{:else}
		<IconButton type="submit" icon={name} {label} leftIcon="logo-{name}" />
	{/if}
</form>
