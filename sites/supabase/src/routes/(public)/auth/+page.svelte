<script>
	import { Auth } from '$lib'
	import { providers } from '$lib/providers.js'
	import { kavach } from '$lib/session'
	import { onMount } from 'svelte'
	import About from '$lib/About.svelte'

	// $: kavach.onAuthChange()
	// onMount(() => {})

	import { page } from '$app/stores'
	/** @type {import('./$types').PageData} */
	export let data

	import { browser } from '$app/environment'

	if (browser) {
		console.log('browser')
	} else {
		console.log('server')
	}
</script>

<content class="p-8 flex flex-col flex-grow gap-4 justify-center items-center">
	<!-- {#if data.user.name}
		<p>Name: {data.user.name}</p>
	{:else}
		sign in
	{/if} -->

	{#if data.params.error !== 'null'}
		<p>
			{data.params.error}
		</p>
	{:else}
		<p>
			Magic link has been sent to {data.params.email}
		</p>
	{/if}
	<div class="flex flex-col w-80">
		<Auth {providers} authUrl="/auth/signin" />
	</div>
</content>
