<script>
	import AuthProvider from './AuthProvider.svelte'
	export let providers
	export let authUrl
</script>

<div class="flex flex-col w-full gap-2 m-auto">
	<h1>Sign in with</h1>
	{#each providers as { provider, label }}
		<AuthProvider {provider} {label} {authUrl} on:submit />
	{/each}
</div>
