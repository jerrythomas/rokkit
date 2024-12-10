<script>
	import 'uno.css'
	import '../app.css'

	import { setContext } from 'svelte'
	import { writable } from 'svelte/store'
	import { page } from '$app/stores'
	import { themable } from '@rokkit/actions'
	import { media } from '$lib'
	import Header from './Header.svelte'

	let { data, children } = $props()

	let site = writable({
		sidebar: $media.large,
		title: data.app.name,
		description: data.app.about,
		code: 'hidden'
	})

	setContext('site', site)
	setContext('media', media)

	let headerStyle = $derived($page.url.pathname == '/' ? '' : 'border-b border-neutral-inset z-10')
</script>

<svelte:body use:themable />
<svelte:head>
	<title>{$site.title}</title>
	<meta name="description" content={$site.description} />
</svelte:head>
<Header menu={data.sections} version={data.version} class={headerStyle} />
{@render children?.()}
