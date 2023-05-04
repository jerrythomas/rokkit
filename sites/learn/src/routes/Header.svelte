<script>
	import { media } from '$lib'
	import ThemeSwitcher from './ThemeSwitcher.svelte'
	// import { Icon } from '@rokkit/core'
	import { getContext } from 'svelte'
	const site = getContext('site')

	let className = ''
	export { className as class }
	// function toggle() {
	// 	$site.sidebar = !$site.sidebar
	// }
	export let version
	export let menu = []
</script>

<header
	class="flex min-h-14 w-full bg-skin-base items-center justify-between relative {className}"
>
	<div class="flex items-center px-4 gap-2">
		<!-- <Icon
			name="i-rokkit:menu"
			class="border-r border-r-skin-subtle cursor-pointer"
			on:click={toggle}
		/> -->
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
