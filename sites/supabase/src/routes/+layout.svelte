<script>
	import 'uno.css'
	import '@unocss/reset/tailwind.css'
	import '../app.scss'
	import { kavach } from '$lib/session'
	import { onMount } from 'svelte'

	/** @type {import('./$types').LayoutData} */
	export let data

	onMount(() => {
		kavach.onAuthChange()
	})
	$: console.log('data in layout', data)
</script>

<slot />
