<script>
	import 'uno.css'
	import '@unocss/reset/tailwind.css'
	import '../app.scss'
	import { onMount } from 'svelte'
	import { ButtonGroup } from '@svelte-spice/form'
	import { Tabs } from '@svelte-spice/core'

	const themes = ['minimal', 'material', 'spicy']
	const items = [
		{ icon: 'menu', content: 'menu' },
		{ icon: 'themes', content: 'themes' },
		{ icon: 'properties', content: 'properties' }
	]
	let currentTheme = themes[2]
	let currentTab = items[0]
	function handleThemeChange(event) {
		document.body.classList.remove(currentTheme)
		currentTheme = event.detail
		document.body.classList.add(currentTheme)
	}
	onMount(() => {
		document.body.classList.add(currentTheme)
	})
</script>

<aside class="sidebar">
	<Tabs {items} bind:activeItem={currentTab} class="lg">
		{currentTab.content}
	</Tabs>
</aside>
<main class="flex flex-col flex-grow">
	<header class="flex flex-row items-center">
		<ButtonGroup
			on:change={handleThemeChange}
			items={themes}
			value={currentTheme}
		/>
	</header>
	<content class="flex flex-col h-full w-full overflow-y-scroll">
		<slot />
	</content>
</main>
