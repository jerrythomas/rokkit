<script>
	/** @type {import('./$types').LayoutData} */
	export let data
</script>

<aside class="bg-secondary-200 w-60">
	Sidebar

	<p>User: {JSON.stringify(data)}</p>
</aside>
<slot />
