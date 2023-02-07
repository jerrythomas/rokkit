<script>
	import 'uno.css'
	import '../app.css'
	import { media } from '$lib'
	import { setContext } from 'svelte'
	setContext('media', media)

	import Header from './Header.svelte'
	import { themable } from '@rokkit/core/actions'

	export let data
</script>

<svelte:body use:themable />
<Header menu={data.sections} version={data.version} />
<main class="flex flex-col w-full flex-grow overflow-hidden relative">
	<slot />
</main>
<!-- <Waves /> -->
