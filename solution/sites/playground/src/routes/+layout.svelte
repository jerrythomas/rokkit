<script lang="ts">
	import 'virtual:uno.css'
	import '../app.css'
	import { page } from '$app/state'
	import { onMount } from 'svelte'
	import { components } from '$lib/components'
	import { initMode, getMode, setMode, type ColorMode } from '$lib/mode.svelte'
	import { getTheme } from '$lib/theme.svelte'

	let { children } = $props()

	let mode = $derived(getMode())
	let theme = $derived(getTheme())

	const modes: { value: ColorMode; icon: string; label: string }[] = [
		{ value: 'system', icon: 'i-lucide:monitor', label: 'System' },
		{ value: 'light', icon: 'i-lucide:sun', label: 'Light' },
		{ value: 'dark', icon: 'i-lucide:moon', label: 'Dark' }
	]

	onMount(() => {
		initMode()
	})
</script>

<div class="grid grid-cols-[200px_1fr] grid-rows-[auto_1fr] h-screen skin-default">
	<header class="col-span-full flex items-center justify-between px-4 py-1.5 bg-surface-z0 border-surface-z3 border-b">
		<a href="/" class="text-sm font-semibold no-underline text-surface-z8">@rokkit/ui</a>
		<div class="flex rounded-md overflow-hidden border-surface-z3 border">
			{#each modes as m}
				<button
					class="flex items-center justify-center w-8 h-7 border-none bg-transparent cursor-pointer transition-all duration-150 text-surface-z5 border-surface-z3 not-first:border-l hover:(bg-surface-z1 text-surface-z7) {mode === m.value ? 'bg-primary-z1! text-primary-z7!' : ''}"
					onclick={() => setMode(m.value)}
					title={m.label}
				>
					<span class={m.icon}></span>
				</button>
			{/each}
		</div>
	</header>

	<nav class="flex flex-col overflow-y-auto p-2 bg-surface-z1 border-surface-z3 border-r">
		<ul class="list-none m-0 p-0 flex flex-col gap-0.5">
			{#each components as item}
				<li>
					<a
						href={item.href}
						class="flex items-center gap-2 py-1.5 px-3 rounded-md no-underline text-[0.8125rem] transition-colors text-surface-z7 hover:bg-surface-z2 {page.url.pathname === item.href ? 'bg-primary-z1! text-primary-z7! font-medium' : ''}"
					>
						<span class="{item.icon} text-base shrink-0"></span>
						<span>{item.text}</span>
					</a>
				</li>
			{/each}
		</ul>
	</nav>

	<main class="overflow-y-auto p-4 bg-surface-z0" data-style={theme}>
		{@render children()}
	</main>
</div>
