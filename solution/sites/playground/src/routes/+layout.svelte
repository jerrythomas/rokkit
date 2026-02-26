<script lang="ts">
	import 'virtual:uno.css'
	import '../app.css'
	import { page } from '$app/state'
	import { onMount } from 'svelte'
	import { componentGroups } from '$lib/components'
	import { initMode, getMode, setMode, type ColorMode } from '$lib/mode.svelte'
	import { getTheme } from '$lib/theme.svelte'
	import { List } from '@rokkit/ui'

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

	<div class="flex flex-col overflow-y-auto bg-surface-z1 border-surface-z3 border-r" data-style="rokkit" data-sidebar>
		<List
			items={[...componentGroups]}
			value={page.url.pathname}
			fields={{ value: 'href' }}
			collapsible
			class="p-2"
		/>
	</div>

	<main class="overflow-y-auto p-4 bg-surface-z0" data-style={theme}>
		{@render children()}
	</main>
</div>
