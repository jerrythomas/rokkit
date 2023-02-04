<script>
	import 'uno.css'
	import '../app.css'
	import { media } from '$lib'
	import { setContext } from 'svelte'
	setContext('media', media)

	import Waves from './Waves.svelte'
	import Header from './Header.svelte'
	import { themable } from '@rokkit/core/actions'

	export let data
</script>

<svelte:body use:themable />
<Header menu={data.sections} version={data.version} />
<main class="flex flex-col w-full h-full overflow-hidden relative">
	<slot />
</main>
<!-- <Waves /> -->
