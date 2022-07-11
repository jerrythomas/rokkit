<script context="module">
	/** @type {import('@sveltejs/kit').Load} */
	export async function load({ url }) {
		const props = {
			props: {
				status: url.searchParams.get('status')
			}
		}

		return props
	}
</script>

<script>
	import { SentryAuth } from '@jerrythomas/sentry'
	import { providers } from '$config/providers'
	import { onMount } from 'svelte'
	import { page } from '$app/stores'
	import { sentry } from '$config'

	onMount(async () => {
		await sentry.handleAuthChange()
	})

	const messages = {
		S001: 'Magic link has been sent to your email. Please check your spam/junk mail also.',
		E001: 'Rate limit exceeded.'
	}

	const { authUrl } = sentry.routes()

	export let status
	$: type = status in messages && status.startsWith('S') ? 'info' : 'error'
	// $: info = status in messages && status.startsWith('S') ? messages[status] : null;
	// $: error = status in messages && status.startsWith('E') ? messages[status] : null;
</script>

<svelte:head>
	<title>Login</title>
</svelte:head>
<div class="h-full flex flex-col flex-grow justify-center items-center ">
	<div class="relative py-4 w-full sm:max-w-sm">
		<div
			class="absolute inset-0 bg-gradient-to-br from-orange-500 to-pink-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"
		/>
		<div
			class="relative py-10 px-8 bg-skin-base text-skin-base shadow-lg sm:rounded-3xl flex flex-col gap-8 items-center"
		>
			<img src="/sentry.svg" alt="Sentry" class="sm:w-3/5" />

			{#if status}
				<span class={type}>{messages[status]}</span>
			{:else}
				<SentryAuth {providers} {authUrl} />
			{/if}
		</div>
	</div>

	<!-- {#if info}

	{/if}
	{#if error}
		<span class="error">{error}</span>
	{/if} -->
</div>
