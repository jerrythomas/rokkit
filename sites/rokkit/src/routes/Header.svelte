<script>
	import Waves from './Waves.svelte'
	import ThemeSwitcher from './ThemeSwitcher.svelte'

	export let menu = []
	export let version
</script>

<header
	class="flex flex-row w-full p-2 md:p-6 items-center justify-between relative"
>
	<a href="/" class="flex items-center gap-3">
		<img src="/rokkit.svg" alt="Rokkit Logo" class="w-8 h-8 md:w-12 md:h-12" />
		<p class="text-xl">Rokkit</p>
	</a>
	<nav class="flex gap-2 rounded-full bg-skin-base text-skin-900 px-4">
		{#each menu as item}
			<a href="/{item.slug}" class="hover:text-secondary-300 leading-loose"
				>{item.title}</a
			>
		{/each}
	</nav>
	<settings class="flex items-center gap-1 md:gap-5 px-2">
		<!-- <DropDown {items} bind:value />
		<Switch bind:value={darkMode} /> -->
		<span class="hidden md:block">{version}</span>
		<ThemeSwitcher />
		<a href="https://github.com/jerrythomas/rokkit" class="text-skin-900 flex">
			<icon class="i-spice:github" />
		</a>
	</settings>
	<!-- <Waves /> -->
</header>
