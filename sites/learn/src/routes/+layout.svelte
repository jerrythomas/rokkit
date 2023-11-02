<script>
	import 'uno.css'
	import '../app.css'

	import { setContext } from 'svelte'
	import { writable } from 'svelte/store'
	import { page } from '$app/stores'
	import { themable } from '@rokkit/actions'
	import { media } from '$lib'
	import Header from './Header.svelte'

	let site = writable({
		sidebar: $media.large
	})

	setContext('site', site)
	setContext('media', media)

	export let data
</script>

<svelte:body use:themable />

<Header
	menu={data.sections}
	version={data.version}
	class={$page.url.pathname == '/' ? '' : 'border-b border-neutral-inset z-10'}
/>
<slot />
