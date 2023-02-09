<script>
	import 'uno.css'
	import '../app.css'
	import { media } from '$lib'
	import { onMount, setContext } from 'svelte'
	import { adjustViewport } from '@rokkit/utils'

	setContext('media', media)

	import Header from './Header.svelte'
	import { themable } from '@rokkit/core/actions'

	export let data

	onMount(() => adjustViewport())
</script>

<svelte:body use:themable />
<Header menu={data.sections} version={data.version} />
<main class="flex flex-col w-full flex-grow overflow-hidden relative">
	<slot />
</main>
<!-- <Waves /> -->
