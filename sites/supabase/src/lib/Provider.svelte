<script>
	import { InputField, IconButton } from '@svelte-spice/form'

	/** @type {string} */
	export let mode = 'oauth'
	/** @type {string} */
	export let name
	/** @type {string} */
	export let label = 'Continue with ' + name
	/** @type {Array<string>} */
	export let scopes = []
	/** @type {Array<string>} */
	export let params = []

	/** @type {string} */
	export let authUrl
</script>

<form method="post" action={authUrl} class="flex flex-row w-full auth {name}">
	<input type="hidden" name="mode" value={mode} />
	{#if mode === 'oauth'}
		<input type="hidden" name="provider" value={name} />
		<input type="hidden" name="scopes" value={scopes} />
		<input type="hidden" name="params" value={params} />
	{/if}
	{#if mode === 'otp'}
		{@const icons = { left: 'logo-magic' }}
		<InputField type="email" name="email" placeholder={label} {icons} />
	{:else}
		<IconButton type="submit" icon={name} {label} leftIcon="logo-{name}" />
	{/if}
</form>
