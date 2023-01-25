<script>
	import ThemeSwitcher from './ThemeSwitcher.svelte'

	export let menu = []
</script>

<header
	class="grid grid-cols-3 min-h-14 w-full items-center justify-between relative shadow-lg"
>
	<a href="/" class="flex items-center gap-3 px-3">
		<img src="/rokkit.svg" alt="Rokkit Logo" class="w-10 h-10" />
		<p class="text-lg">Rokkit</p>
	</a>
	<span class="flex justify-around items-center">
		<nav class="flex gap-2  rounded-full bg-skin-base text-skin-900 px-4">
			{#each menu as item}
				<a href="/{item.slug}" class="hover:text-secondary-300 leading-loose"
					>{item.title}</a
				>
			{/each}
		</nav>
	</span>
	<settings class="flex items-center justify-end gap-3 pr-4">
		<ThemeSwitcher />
		<a href="https://github.com/jerrythomas/rokkit" class="text-skin-900 flex">
			<icon class="i-spice:github" />
		</a>
	</settings>
</header>
