<script context="module">
	import { sentry } from '$config'

	/** @type {import('@sveltejs/kit').Load} */
	export async function load({ url, session }) {
		return sentry.redirectProtectedRoute(url, session)
	}
</script>

<script>
	import 'virtual:windi.css'
	import '../app.css'

	import { page } from '$app/stores'
	import LoginIcon from '$lib/icons/Login.svelte'
	import LogoutIcon from '$lib/icons/Logout.svelte'
	import TodoIcon from '$lib/icons/Todo.svelte'
	import AboutIcon from '$lib/icons/About.svelte'
	import { onMount } from 'svelte'

	onMount(async () => {
		await sentry.handleAuthChange()
	})
</script>

<main
	class="flex flex-col sm:flex-row sm:h-full md:w-200 md:h-120 md:border md:shadow md:rounded-lg"
>
	<aside class="w-full sm:w-64 flex flex-col relative">
		<header
			class="flex flex-row items-center justify-center px-4 gap-2 sm:justify-start"
		>
			<span class="flex items-center gap-2 py-2">
				<img
					class="w-10 h-10 sm:w-16 sm:h-16"
					src="https://raw.githubusercontent.com/jerrythomas/sentry/main/src/sentry.svg"
					alt="sentry"
				/>
				Sentry
			</span>
		</header>
		<nav
			class="flex flex-row leading-loose w-full justify-center gap-2 sm:gap-0 sm:flex-col sm:divide-y sm:w-64"
		>
			<a class:selected={$page.url.pathname === '/'} href="/">
				<AboutIcon />
				About
			</a>
			<a class:selected={$page.url.pathname === '/todos'} href="/todos"
				><TodoIcon />Todo</a
			>
			<a class:selected={$page.url.pathname === '/auth'} href="/auth"
				><LoginIcon /> Login</a
			>
			<a
				class:selected={$page.url.pathname === '/auth/logout'}
				href="/auth/logout"><LogoutIcon /> Logout</a
			>
		</nav>
		<a href="https://kit.svelte.dev" class="absolute bottom-0">kit.svelte.dev</a
		>
	</aside>
	<slot />
</main>

<style lang="postcss">
	nav a {
		@apply box-border px-4 py-1 sm:py-2 flex flex-row items-center no-underline gap-2 rounded-t-lg sm:rounded-none;
	}
	nav a:hover {
		@apply bg-gradient-to-b from-gray-100 to-gray-200 rounded-t-lg sm:rounded-none;
	}
	.selected {
		@apply bg-gray-100 border-t-3 border-red-400 py-1 sm:py-2 sm:border-0 sm:border-l-4;
	}
</style>
