<script>
	import 'virtual:windi.css'
	import '../app.css'

	import Header from '$lib/header/Header.svelte'

	import { sentry } from '$config'
	import { onMount } from 'svelte'

	onMount(async () => {
		// await sentry.handleAuthChange()
	})
</script>

<Header />

<main class="justify-center items-center w-full p-10">
	<slot />
</main>

<footer>
	<p>
		visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to learn SvelteKit
	</p>
</footer>

<style>
	main {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 1rem;
		width: 100%;
		max-width: 1024px;
		margin: 0 auto;
		box-sizing: border-box;
	}

	footer {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 40px;
	}

	footer a {
		font-weight: bold;
	}

	@media (min-width: 480px) {
		footer {
			padding: 40px 0;
		}
	}
</style>
