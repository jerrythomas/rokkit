<script>
	import 'uno.css'
	import '../app.css'

	import { i18n } from '$lib/i18n'
	import { ParaglideJS } from '@inlang/paraglide-sveltekit'
	import { setContext } from 'svelte'
	import { writable } from 'svelte/store'
	import Header from './Header.svelte'

	/**
	 * @typedef {Object} Props
	 * @property {import('./$types').PageData} data
	 * @property {import('svelte').Component}  children
	 */
	/** @type {Props} */
	let { data, children } = $props()

	let site = writable({
		// sidebar: $media.large,
		title: data.app.name,
		description: data.app.about,
		code: 'hidden'
	})

	setContext('site', site)
</script>

<svelte:body />
<svelte:head>
	<title>{$site.title}</title>
	<meta name="description" content={$site.description} />
</svelte:head>

<ParaglideJS {i18n}>
	<Header />
	{@render children()}
</ParaglideJS>
