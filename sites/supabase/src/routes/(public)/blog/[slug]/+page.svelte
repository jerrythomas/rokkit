<script>
	import { page } from '$app/stores'
	// export let data;
</script>

<content class="flex flex-col p-8 gap-4">
	{#if $page.data.user}
		<h1>Welcome back {$page.data.user.name}!</h1>
		<h2>{$page.data.title}</h2>
		<p>{$page.data.content}</p>
	{:else}
		<p>Please <a href="/login">log in</a> or <a href="/register">register</a>.</p>
	{/if}
</content>
