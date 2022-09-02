<script>
	import Provider from './Provider.svelte'

	/** @typedef Provider
	 * @property {string} name - the name of the provider
	 * @property {string} label - label to be used in the input or button
	 */
	/** @type {Array<Provider>} */
	export let providers
	/** @type {string}*/
	export let authUrl
</script>

<div class="flex flex-col gap-2">
	{#each providers as { name, label }}
		<Provider {name} {label} {authUrl} on:submit />
	{/each}
</div>
