<script>
	import 'uno.css'
	import '../app.css'

	import { onMount, setContext } from 'svelte'
	import { writable } from 'svelte/store'
	import { browser } from '$app/environment'
	import { media } from '$lib'
	import { adjustViewport } from '@rokkit/utils'
	import { ProgressBar } from '@rokkit/atoms'
	import { themable } from '@rokkit/actions'
	import Header from './Header.svelte'
	import { page } from '$app/stores'
	import { afterNavigate, beforeNavigate } from '$app/navigation'

	let site = writable({
		sidebar: $media.large
	})

	setContext('site', site)
	setContext('media', media)

	export let data
	let loading = false
	beforeNavigate(() => (loading = true))
	afterNavigate(() => (loading = false))

	$: adjustViewport(browser, $media.small)
</script>

<svelte:body use:themable />
{#if loading}
	<ProgressBar />
{/if}
<Header
	menu={data.sections}
	version={data.version}
	class={$page.url.pathname == '/' ? '' : 'shadow-md z-10'}
/>
<slot />
