<script>
	import { Input, IconButton } from '@svelte-spice/core'

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
		<Input type="email" name="email" placeholder={label} icon="logo-{name}" tabindex={0} />
	{:else}
		<IconButton type="submit" icon={name} {label} tabindex={0} leftIcon="logo-{name}" />
	{/if}
</form>
