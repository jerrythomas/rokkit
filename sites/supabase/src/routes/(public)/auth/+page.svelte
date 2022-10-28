<script>
	import { Auth } from '$lib'
	import { providers } from '$lib/providers.js'
	/** @type {import('./$types').PageData} */
	// export let data
</script>

<content class="p-8 flex flex-col flex-grow gap-4 justify-center items-center">
	<!-- {#if data.user.name}
		<p>Name: {data.user.name}</p>
	{:else}
		sign in
	{/if} -->
	<a href="/api/login"> Login </a>
	<div class="flex flex-col w-80">
		<Auth {providers} authUrl="/api/auth/login" />
	</div>
</content>
