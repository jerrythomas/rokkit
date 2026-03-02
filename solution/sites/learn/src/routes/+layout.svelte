<script>
	// @ts-nocheck
	import 'uno.css'
	import '../app.css'

	import { setContext } from 'svelte'
	import { page } from '$app/state'
	import { media } from '$lib/media.js'
	import { vibe } from '@rokkit/states'
	import { themable } from '@rokkit/actions'
	import Header from './Header.svelte'

	/**
	 * @typedef {Object} Props
	 * @property {import('./$types').PageData} data
	 * @property {import('svelte').Component}  children
	 */
	/** @type {Props} */
	let { data, children } = $props()

	let site = $state({
		sidebar: media.large.current,
		code: 'hidden',
		dir: 'ltr'
	})

	setContext('site', () => site)

	let showRootHeader = $derived(
		page.url.pathname === '/' || page.url.pathname.startsWith('/playground')
	)
	let headerStyle = $derived(page.url.pathname === '/' ? '' : 'border-b border-surface-z1 z-10')
</script>

<svelte:body use:themable={{ theme: vibe, storageKey: 'rokkit-theme' }} />
<svelte:head>
	<title>{data.app.name}</title>
	<meta name="description" content={data.app.about} />
</svelte:head>
{#if showRootHeader}
	<Header version={data.app.version} class={headerStyle}></Header>
{/if}
{@render children?.()}
