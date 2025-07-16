<script>
	import { getContext } from 'svelte'
	import { afterNavigate, beforeNavigate } from '$app/navigation'
	// import { page } from '$app/state'
	import { media } from '$lib/media.js'
	import { Icon, ProgressBar, Toggle } from '@rokkit/ui'
	import ThemeSwitcher from './ThemeSwitcher.svelte'

	const site = getContext('site')()

	/**
	 * @typedef {Object} Props
	 * @property {string} [class]
	 * @property {any} version
	 * @property {any} [menu]
	 */

	/** @type {Props} */
	let { class: className = '', version, menu = [] } = $props()
	let loading = $state(false)

	beforeNavigate(() => {
		loading = true
	})
	afterNavigate(() => {
		loading = false
	})
</script>

<header
	class="bg-neutral-z1 text-neutral-z8 relative flex min-h-14 w-full items-center justify-between {className}"
>
	{#if loading}
		<ProgressBar class="z-5 absolute top-0" />
	{/if}
	<div class="flex items-center gap-2 px-4">
		<a href="/" class="flex items-center">
			{#if media.small.current}
				<img src="/rokkit-icon.svg" alt="Rokkit Logo" class="h-12" />
			{:else}
				<img src="/rokkit-light.svg" alt="Rokkit Logo" class="h-10" />
			{/if}
		</a>
		{#if !media.small.current}
			<small class="font-small px-2">{version}</small>
		{/if}
	</div>
	<settings class="flex items-center justify-end gap-3 pr-4">
		<nav class="flex gap-3 pr-3 uppercase">
			{#each menu as item, index (index)}
				<a
					href="/{item.slug}"
					class="active:border-secondary-700 hover:text-secondary-700 border-b-2 leading-loose"
					>{item.title}</a
				>
			{/each}
		</nav>
		<ThemeSwitcher />
		<a href="https://github.com/jerrythomas/rokkit" target="_blank" data-button-root>
			<Icon name="i-logo:github" label="Rokkit on Github" />
		</a>
	</settings>
</header>
