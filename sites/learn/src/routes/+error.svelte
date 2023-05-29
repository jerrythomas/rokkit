<script>
	import { page } from '$app/stores'
	import Error404 from './404-error.svelte'

	// we don't want to use <svelte:window bind:online> here, because we only care about the online
	// state when the page first loads
	let online = typeof navigator !== 'undefined' ? navigator.onLine : true
</script>

<svelte:head>
	<title>{$page.status}</title>
</svelte:head>

<div class="w-full flex flex-col items-center justify-center">
	{#if $page.status === 404}
		<Error404 />
		<a href="http://www.freepik.com">Designed by stories / Freepik</a>
	{:else if online}
		<h1>Yikes!</h1>

		{#if $page.error?.message}
			<p class="error">{$page.status}: {$page.error.message}</p>
		{/if}

		<p>Please try reloading the page.</p>

		<p>
			If the error persists, please raise an issue on
			<a href="https://github.com/jerrythomas/rokkit">GitHub</a>. Thanks!
		</p>
	{:else}
		<h1>It looks like you're offline</h1>
		<p>Reload the page once you've found the internet.</p>
	{/if}
</div>
