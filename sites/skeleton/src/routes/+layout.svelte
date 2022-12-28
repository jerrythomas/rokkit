<script>
	import 'uno.css'
	import '@unocss/reset/tailwind.css'
	import '../app.scss'
	import { onMount } from 'svelte'
	import { ButtonGroup } from '@rokkit/form'
	import Sidebar from './sidebar.svelte'

	const themes = ['minimal', 'material', 'spicy']
	let currentTheme = themes[2]
	// let currentTab = items[0]

	function handleThemeChange(event) {
		document.body.classList.remove(currentTheme)
		currentTheme = event.detail
		document.body.classList.add(currentTheme)
	}
	onMount(() => {
		document.body.classList.add(currentTheme)
	})
</script>

<Sidebar />
<main class="flex flex-col flex-grow">
	<header class="flex flex-row items-center justify-between">
		<ButtonGroup
			on:change={handleThemeChange}
			items={themes}
			value={currentTheme}
		/>
		<img src="/favicon-32x32.png" alt="rokkit" />
	</header>
	<content class="flex flex-col h-full w-full overflow-y-scroll">
		<slot />
	</content>
</main>
