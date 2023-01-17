<script>
	import { DropDown } from '@rokkit/core'
	import { Switch } from '@rokkit/input'
	import { theme } from '@rokkit/core/stores'

	export let menu = []
	let darkMode = true
	let items = [{ text: 'Rokkit' }, { text: 'Modern' }, { text: 'Material' }]
	let value = items[0]
	$: theme.set({
		name: value.text.toLowerCase(),
		mode: darkMode ? 'dark' : 'light'
	})
</script>

<header
	class="flex flex-row w-full px-10 py-6 items-center justify-between text-white"
>
	<div class="flex items-center gap-3">
		<img src="/rokkit.svg" alt="Rokkit Logo" class="w-12 h-12" />
		<p class="text-xl">Rokkit</p>
	</div>
	<nav class="flex gap-2 rounded-full bg-skin-base text-skin-900 px-4">
		{#each menu as item}
			<a href="/{item.slug}" class="hover:text-secondary-300 leading-loose"
				>{item.title}</a
			>
		{/each}
	</nav>
	<settings class="flex items-center gap-5">
		<DropDown {items} bind:value />
		<Switch bind:value={darkMode} />
	</settings>
</header>
