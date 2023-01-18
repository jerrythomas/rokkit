<script>
	import { DropDown } from '@rokkit/core'
	import { Switch } from '@rokkit/input'
	import { theme } from '@rokkit/core/stores'

	export let menu = []
	let darkMode = $theme.mode == 'dark'
	let items = [
		{ text: 'Rokkit' } /*, { text: 'Modern' }, { text: 'Material' }*/
	]
	let value = getCurrenTheme()

	function getCurrenTheme() {
		const matched = items.filter(
			(item) => item.text.toLowerCase() === $theme.name
		)
		return matched.length > 0 ? matched[0] : items[0]
	}
	$: if (value) {
		theme.set({
			name: value.text.toLowerCase(),
			mode: darkMode ? 'dark' : 'light'
		})
	}
</script>

<header
	class="flex flex-row w-full px-10 py-6 items-center justify-between text-white"
>
	<a href="/" class="flex items-center gap-3">
		<img src="/rokkit.svg" alt="Rokkit Logo" class="w-12 h-12" />
		<p class="text-xl">Rokkit</p>
	</a>
	<nav class="flex gap-2 rounded-full bg-skin-base text-skin-900 px-4">
		{#each menu as item}
			<a href="/{item.slug}" class="hover:text-secondary-300 leading-loose"
				>{item.title}</a
			>
		{/each}
	</nav>
	<settings class="flex items-center gap-5">
		<!-- <DropDown {items} bind:value /> -->
		<Switch bind:value={darkMode} />
	</settings>
</header>
