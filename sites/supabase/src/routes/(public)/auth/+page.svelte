<script>
	import { Auth } from '$lib'
	import { providers } from '$lib/providers.js'
	import { kavach } from '$lib/session'
	import { onMount } from 'svelte'
	import About from '$lib/About.svelte'

	// onMount(async () => {
	// 	// console.log()
	// 	kavach.onAuthChange('auth.page.onmount')
	// 	kavach.adapter.handler.auth.onAuthStateChange((event, session) => {
	// 		console.log('auth state changed in auth page', session, event)
	// 	})
	// })
	import { browser } from '$app/environment'
	import { page } from '$app/stores'
	/** @type {import('./$types').PageData} */
	export let data
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
