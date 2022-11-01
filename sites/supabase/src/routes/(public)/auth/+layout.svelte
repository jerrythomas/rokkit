<script>
	import { kavach } from '$lib/session'
	import { onMount } from 'svelte'
	import About from '$lib/About.svelte'

	// onMount(async () => {
	// 	// console.log()
	// 	kavach.onAuthChange('auth.layout.svelte.onmount')
	// })
</script>

<aside class="flex bg-primary w-1/2 p-8 items-center justify-center">
	<About />
</aside>
<slot />
