<script>
	import 'uno.css'
	import '@unocss/reset/tailwind.css'
	import '../app.scss'
	import { onMount } from 'svelte'

	const themes = ['minimal', 'material', 'spicy']
	let currentTheme = themes[0]
	let selectedTheme = themes[0]

	function handleThemeChange(selected) {
		document.body.classList.remove(currentTheme)
		currentTheme = selected
		document.body.classList.add(currentTheme)
	}
	onMount(() => {
		document.body.classList.add(currentTheme)
	})

	// import { menu } from '../config'
	// import { Accordion, Link, Sidebar } from '@rokkit/core'
	// import { page } from '$app/stores'

	// const fields = { id: 'url' }
	// const using = { default: Link }
	// $: activeItem = menu.filter((m) => m.url == $page.url.pathname)[0]
</script>

<header class="flex flex-row">
	{#each themes as theme}
		<button on:click={() => handleThemeChange(theme)}>{theme}</button>
	{/each}
</header>

<main class="flex flex-col flex-grow bg-primary-50 overflow-scroll">
	<slot />
</main>
