<script>
	import { media } from '$lib'
	import ThemeSwitcher from './ThemeSwitcher.svelte'

	export let menu = []
</script>

<header
	class="flex min-h-14 w-full bg-skin-100 items-center justify-between relative shadow-lg"
>
	<a href="/" class="flex items-center pl-2 md:pl-4">
		{#if $media.small}
			<img src="/rokkit-icon.svg" alt="Rokkit Logo" class="h-12" />
		{:else}
			<img src="/rokkit-light.svg" alt="Rokkit Logo" class="h-10" />
		{/if}
	</a>
	<settings class="flex items-center justify-end gap-3 pr-4">
		<nav class="flex gap-3 text-skin-900 uppercase pr-3">
			{#each menu as item}
				<a
					href="/{item.slug}"
					class="border-b-2 active:border-secondary-700 hover:text-secondary-700 leading-loose"
					>{item.title}</a
				>
			{/each}
		</nav>
		<ThemeSwitcher />
		<a href="https://github.com/jerrythomas/rokkit" class="text-skin-900 flex">
			<icon class="i-spice:github" />
		</a>
	</settings>
</header>
