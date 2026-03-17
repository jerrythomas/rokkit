<script>
	// @ts-nocheck
	import 'uno.css'
	import '../app.css'

	import { setContext } from 'svelte'
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
</script>

<svelte:body use:themable={{ theme: vibe, storageKey: 'rokkit-theme' }} />
<svelte:head>
	<title>{data.app.name}</title>
	<meta name="description" content={data.app.about} />
</svelte:head>

<div class="flex h-screen flex-col overflow-hidden">
	<Header version={data.app.version} menu={data.menu} />
	<div class="min-h-0 flex-1 flex flex-col overflow-hidden">
		{@render children?.()}
	</div>
</div>
