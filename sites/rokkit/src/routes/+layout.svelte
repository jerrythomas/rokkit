<script>
	import 'uno.css'
	import '../app.css'
	import { setContext } from 'svelte'
	import { writable } from 'svelte/store'
	import { browser } from '$app/environment'
	import { media } from '$lib'
	import { adjustViewport } from '@rokkit/utils'
	import { themable } from '@rokkit/core/actions'
	import Header from './Header.svelte'
	import { page } from '$app/stores'
	import { path } from 'ramda'
	let site = writable({
		sidebar: $media.large
	})

	setContext('site', site)
	setContext('media', media)

	export let data

	$: adjustViewport(browser, $media.small)
</script>

<svelte:body use:themable />
<Header
	menu={data.sections}
	version={data.version}
	class={$page.url.pathname == '/' ? '' : 'shadow-md z-10'}
/>
<slot />
