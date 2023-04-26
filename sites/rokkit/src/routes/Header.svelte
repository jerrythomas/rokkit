<script>
	import { media } from '$lib'
	import ThemeSwitcher from './ThemeSwitcher.svelte'
	import { getContext } from 'svelte'
	let site = getContext('site')

	function toggle() {
		$site.sidebar = !$site.sidebar
	}
	export let version
	export let menu = []
</script>

<header
	class="flex min-h-14 w-full bg-skin-subtle items-center justify-between relative shadow-md"
>
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<div class="flex items-center md:px-2">
		<div on:click={toggle} class="flex p-4 justify-center cursor-pointer">
			<icon class="i-rokkit:menu" />
		</div>
		<a href="/" class="flex items-center">
			{#if $media.small}
				<img src="/rokkit-icon.svg" alt="Rokkit Logo" class="h-12" />
			{:else}
				<img src="/rokkit-light.svg" alt="Rokkit Logo" class="h-10" />
			{/if}
		</a>
		{#if !$media.small}
			<small class="font-small px-2">{version}</small>
		{/if}
	</div>
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
			<icon class="i-rokkit:github" />
		</a>
	</settings>
</header>
