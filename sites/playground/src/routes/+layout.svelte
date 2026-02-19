<script lang="ts">
	import 'virtual:uno.css'
	import '../app.css'
	import { page } from '$app/state'
	import { onMount } from 'svelte'
	import { components, themes, type Theme } from '$lib/components'
	import { initMode, getMode, setMode, type ColorMode } from '$lib/mode.svelte'

	let { children } = $props()

	let theme = $state<Theme>('shingoki')
	let mode = $derived(getMode())

	const modes: { value: ColorMode; icon: string; label: string }[] = [
		{ value: 'system', icon: 'i-lucide:monitor', label: 'System' },
		{ value: 'light', icon: 'i-lucide:sun', label: 'Light' },
		{ value: 'dark', icon: 'i-lucide:moon', label: 'Dark' }
	]

	onMount(() => {
		initMode()
	})
</script>

<div class="layout skin-default">
	<header class="header">
		<a href="/" class="logo">@rokkit/ui</a>
		<div class="header-controls">
			<div class="mode-toggle">
				{#each modes as m}
					<button
						class="mode-btn"
						class:active={mode === m.value}
						onclick={() => setMode(m.value)}
						title={m.label}
					>
						<span class={m.icon}></span>
					</button>
				{/each}
			</div>
			<div class="theme-switcher">
				<label for="theme-select">Theme</label>
				<select id="theme-select" bind:value={theme}>
					{#each themes as t}
						<option value={t}>{t}</option>
					{/each}
				</select>
			</div>
		</div>
	</header>

	<nav class="sidebar">
		<ul class="nav-list">
			{#each components as item}
				<li>
					<a href={item.href} class="nav-item" class:active={page.url.pathname === item.href}>
						<span class={item.icon}></span>
						<span>{item.text}</span>
					</a>
				</li>
			{/each}
		</ul>
	</nav>

	<main class="content" data-style={theme === 'shingoki' ? undefined : theme}>
		{@render children()}
	</main>
</div>

<style>
	.layout {
		display: grid;
		grid-template-columns: 200px 1fr;
		grid-template-rows: auto 1fr;
		height: 100vh;
	}

	.header {
		grid-column: 1 / -1;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.375rem 1rem;
		border-bottom: 1px solid rgb(var(--color-surface-300));
		background: rgb(var(--color-surface-50));
	}

	.logo {
		font-size: 0.875rem;
		font-weight: 600;
		margin: 0;
		color: rgb(var(--color-surface-800));
		text-decoration: none;
	}

	.header-controls {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.mode-toggle {
		display: flex;
		border: 1px solid rgb(var(--color-surface-300));
		border-radius: 0.375rem;
		overflow: hidden;
	}

	.mode-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 1.75rem;
		border: none;
		background: transparent;
		color: rgb(var(--color-surface-500));
		cursor: pointer;
		transition: all 0.1s;
	}

	.mode-btn:hover {
		background: rgb(var(--color-surface-100));
		color: rgb(var(--color-surface-700));
	}

	.mode-btn.active {
		background: rgb(var(--color-primary-100));
		color: rgb(var(--color-primary-700));
	}

	.mode-btn + .mode-btn {
		border-left: 1px solid rgb(var(--color-surface-300));
	}

	.theme-switcher {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.8125rem;
	}

	.theme-switcher label {
		color: rgb(var(--color-surface-600));
	}

	.theme-switcher select {
		padding: 0.25rem 0.5rem;
		border: 1px solid rgb(var(--color-surface-300));
		border-radius: 0.375rem;
		background: rgb(var(--color-surface-50));
		font-size: 0.8125rem;
	}

	.sidebar {
		border-right: 1px solid rgb(var(--color-surface-300));
		overflow-y: auto;
		padding: 0.5rem;
		background: rgb(var(--color-surface-100));
	}

	.nav-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
	}

	.nav-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.375rem 0.75rem;
		border-radius: 0.375rem;
		text-decoration: none;
		font-size: 0.8125rem;
		color: rgb(var(--color-surface-700));
		transition: background 0.1s;
	}

	.nav-item:hover {
		background: rgb(var(--color-surface-200));
	}

	.nav-item.active {
		background: rgb(var(--color-primary-100));
		color: rgb(var(--color-primary-700));
		font-weight: 500;
	}

	.nav-item span:first-child {
		font-size: 1rem;
		flex-shrink: 0;
	}

	.content {
		overflow-y: auto;
		padding: 1rem;
		background: rgb(var(--color-surface-50));
	}
</style>
