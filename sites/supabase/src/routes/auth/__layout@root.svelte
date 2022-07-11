<script context="module">
	import { sentry } from '$config'

	/** @type {import('@sveltejs/kit').Load} */
	export async function load({ url, session }) {
		return sentry.redirectProtectedRoute(url, session)
	}
</script>

<slot />
