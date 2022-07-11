<script>
	import { sentry } from '$config'
	import { onMount } from 'svelte'

	const message = 'Logging out...'
	onMount(async () => {
		await sentry.handleSignOut()
	})
</script>

<svelte:head>
	<title>{message}</title>
</svelte:head>

<p>{message}</p>
