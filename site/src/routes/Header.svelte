<script>
	import { afterNavigate, beforeNavigate } from '$app/navigation'
	import { page } from '$app/state'
	import { media } from '$lib/media.js'
	import { ProgressBar } from '@rokkit/ui'
	import { ThemeSwitcherToggle } from '@rokkit/app'

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
	class="border-surface-z2 bg-surface-z1 relative z-50 flex h-12 w-full flex-shrink-0 items-center justify-between border-b px-4 {className}"
>
	{#if loading}
		<ProgressBar class="absolute inset-x-0 top-0 z-5" />
	{/if}

	<div class="flex items-center gap-2">
		<a href="/" class="flex items-center no-underline">
			{#if media.small.current}
				<img src="/rokkit-icon.svg" alt="Rokkit" class="h-7" />
			{:else}
				<img src="/rokkit-light.svg" alt="Rokkit" class="h-6" />
			{/if}
		</a>
		{#if !media.small.current}
			<span class="text-surface-z4 text-[11px]">{version}</span>
		{/if}
	</div>

	<nav class="flex items-center gap-1">
		{#each menu as item}
			{@const active = page.url.pathname.startsWith(item.match)}
			<a
				href="/{item.slug}"
				class="text-surface-z5 hover:text-surface-z8 hover:bg-surface-z2 rounded-md px-3 py-1 text-xs font-medium no-underline transition-colors {active
					? 'bg-surface-z2 text-surface-z8'
					: ''}">{item.title}</a
			>
		{/each}
	</nav>

	<div class="flex items-center gap-1">
		<ThemeSwitcherToggle size="sm" />
		<a
			href="https://github.com/jerrythomas/rokkit"
			target="_blank"
			rel="noopener noreferrer"
			class="text-surface-z5 hover:text-surface-z8 flex h-8 w-8 items-center justify-center rounded-md no-underline"
			aria-label="Rokkit on GitHub"
		>
			<span class="i-logo:github text-lg" aria-hidden="true"></span>
		</a>
	</div>
</header>
