<script>
	import { goto } from '$app/navigation'
	import { Icon } from 'rokkit/atoms'
	import { media } from '$lib'
	import ThemeSwitcher from './ThemeSwitcher.svelte'
	// import { Icon } from 'rokkit/atoms'
	// import { getContext } from 'svelte'
	// const site = getContext('site')

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
	<div class="flex items-center gap-2 px-4">
		<!-- <Icon
			name="i-rokkit:menu"
			class="cursor-pointer border-r border-r-skin-subtle"
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
			<small class="px-2 font-small">{version}</small>
		{/if}
	</div>
	<settings class="flex items-center justify-end gap-3 pr-4">
		<nav class="flex gap-3 pr-3 uppercase text-skin-900">
			{#each menu as item}
				<a
					href="/{item.slug}"
					class="border-b-2 leading-loose active:border-secondary-700 hover:text-secondary-700"
					>{item.title}</a
				>
			{/each}
		</nav>

		<ThemeSwitcher />
		<Icon
			name="i-rokkit:github"
			label="Rokkit on Github"
			role="button"
			on:click={() => goto('https://github.com/jerrythomas/rokkit')}
		/>
		<!-- <a href="https://github.com/jerrythomas/rokkit" class="flex text-skin-900">
			<icon class="i-rokkit:github" />
		</a> -->
	</settings>
</header>
