<script>
	/** @type {import('./$types').PageData} */
	export let data
</script>

<main>
	<p>Hello: {JSON.stringify(data)}</p>

	<a href="/api/auth/login">login</a>
	<a href="/api/auth/logout">logout</a>
	<a href="/api/auth/session">session</a>
</main>
