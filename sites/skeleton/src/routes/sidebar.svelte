<script>
	import { Tabs, Accordion, Link, Searchable } from '@rokkit/core'
	import { menu, options } from '$lib/config'
	import PropertyEditor from '$lib/PropertyEditor.svelte'
	import ThemeEditor from '$lib/ThemeEditor.svelte'
	import { media } from '$lib/store'

	const using = { default: Link }
	let currentTab = options[0]
	let search = ''
	$: items = options.slice(0, $media.large ? 3 : 2)
	// $: filtered = search
	// 	? menu
	// 	: menu.filter((item) =>
	// 			item.text.toLowerCase().includes(search.toLowerCase())
	// 	  )
	// $: alert(menu.filter((item) => item.))
</script>

<aside class="sidebar">
	<Tabs {items} bind:activeItem={currentTab} class="lg">
		{#if currentTab.content === 'menu'}
			<Searchable bind:search>
				<Accordion items={menu} {using} />
			</Searchable>
		{:else if currentTab.content === 'properties'}
			<PropertyEditor />
		{:else}
			<ThemeEditor />
		{/if}
	</Tabs>
</aside>
