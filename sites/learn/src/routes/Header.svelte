<script>
	import { getContext } from 'svelte'
	import { afterNavigate, beforeNavigate } from '$app/navigation'
	import { page } from '$app/stores'
	import { Icon, ProgressBar, Toggle } from '@rokkit/ui'
	import { media } from '$lib'
	import ThemeSwitcher from './ThemeSwitcher.svelte'

	const site = getContext('site')
	let className = ''
	export { className as class }

	export let version
	export let menu = []
	const codeOptions = [
		{ icon: 'i-app:code-visible', value: 'hidden', label: 'Hide Code' },
		{ icon: 'i-app:code-hidden', value: 'visible', label: 'Show Code' }
	]

	let loading = false
	const handleCodeVisibility = ({ detail }) => {
		site.update((current) => ({ ...current, code: detail.value }))
	}
	beforeNavigate(() => (loading = true))
	afterNavigate(() => (loading = false))

	$: showCodeToggle = !media.small && $page.url.pathname !== '/'
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
		{#if showCodeToggle}
			<Toggle options={codeOptions} on:change={handleCodeVisibility} />
		{/if}
		<ThemeSwitcher />
		<a href="https://github.com/jerrythomas/rokkit" target="_blank" rel="noopener noreferrer">
			<Icon
				name="i-logo:github"
				label="Rokkit on Github"
				role="button"
				class="border border-neutral-muted rounded"
			/>
		</a>
	</settings>
</header>
