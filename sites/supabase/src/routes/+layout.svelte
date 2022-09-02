<script>
	import 'uno.css'
	import '@unocss/reset/tailwind.css'
	import '../app.scss'
	import { watcher } from '$lib/auth'

	$: watcher()
</script>

<slot />
