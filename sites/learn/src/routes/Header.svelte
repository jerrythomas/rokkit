<script>
	import { goto, afterNavigate, beforeNavigate } from '$app/navigation'
	import { Icon, ProgressBar } from '@rokkit/atoms'
	import { media } from '$lib'
	import ThemeSwitcher from './ThemeSwitcher.svelte'

	let className = ''
	export { className as class }

	export let version
	export let menu = []

	let loading = false
	beforeNavigate(() => (loading = true))
	afterNavigate(() => (loading = false))
</script>

<header
	class="flex min-h-14 w-full bg-neutral-base items-center justify-between relative {className}"
>
	{#if loading}
		<ProgressBar class="absolute top-0 z-5" />
	{/if}
	<div class="flex items-center gap-2 px-4">
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
		<nav class="flex gap-3 pr-3 uppercase text-neutral-900">
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
			name="i-logo:github"
			label="Rokkit on Github"
			role="button"
			on:click={() => goto('https://github.com/jerrythomas/rokkit')}
		/>
	</settings>
</header>
