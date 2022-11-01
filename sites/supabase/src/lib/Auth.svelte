<script>
	import Provider from './Provider.svelte'

	/**
	 * @typedef Provider
	 * @property {'otp'|'oauth'|'password'} mode - mode of auth
	 * @property {string} name - the name of the provider
	 * @property {string} label - label to be used in the input or button
	 * @property {Array<string>} scopes - array of scopes for access
	 * @property {Array<string>} params - array of parameters for access
	 */
	/** @type {Array<Provider>} */
	export let providers
	/** @type {string}*/
	export let authUrl
</script>

<div class="flex flex-col gap-2">
	{#each providers as data}
		<Provider {...data} {authUrl} on:submit />
	{/each}
</div>
