<script>
	import { Tabs, Accordion, Link } from '@svelte-spice/core'
	import { menu, options } from '$lib/config'
	import PropertyEditor from '$lib/PropertyEditor.svelte'
	import ThemeEditor from '$lib/ThemeEditor.svelte'
	import { media } from '$lib/store'

	const using = { default: Link }
	let currentTab = options[0]
	$: items = options.slice(0, $media.large ? 3 : 2)
</script>

<aside class="sidebar">
	<Tabs {items} bind:activeItem={currentTab} class="lg">
		{#if currentTab.content === 'menu'}
			<Accordion items={menu} {using} class="p-4" />
		{:else if currentTab.content === 'properties'}
			<PropertyEditor />
		{:else}
			<ThemeEditor />
		{/if}
	</Tabs>
</aside>
