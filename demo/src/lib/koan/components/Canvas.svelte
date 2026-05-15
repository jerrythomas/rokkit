<script lang="ts">
	import ShowcaseCanvas from './ShowcaseCanvas.svelte'
	import Gallery from './Gallery.svelte'
	import { koan, selectDemo } from '../store.svelte'
	import { catalog, findById } from '../catalog'
	import { runMatch } from '../match.svelte'
	import type { Component } from 'svelte'

	const matches = $derived(runMatch(koan.query))
	const active = $derived(koan.activeDemoId ? findById(koan.activeDemoId) : null)

	let loadedComponent = $state<Component | null>(null)
	let loadingError = $state<string | null>(null)

	$effect(() => {
		loadedComponent = null
		loadingError = null
		if (!active) return
		active
			.load()
			.then((mod) => (loadedComponent = mod.default))
			.catch((err) => (loadingError = err?.message ?? 'failed to load demo'))
	})

	function backToGallery() {
		koan.activeDemoId = null
	}

	function pickGalleryItem(item: { id: string }) {
		selectDemo(item.id)
	}

	const galleryItems = $derived(matches.length > 0 ? matches : catalog)
	const breadcrumb = $derived(
		koan.query.trim() ? `matches for "${koan.query.trim()}"` : 'all demos'
	)
</script>

<ShowcaseCanvas>
	{#snippet toolbar()}
		{#if active}
			<button type="button" class="back" onclick={backToGallery}>
				<span aria-hidden="true">←</span>
				<span>{active.title}</span>
			</button>
		{/if}
	{/snippet}
	{#if active}
		{#if loadingError}
			<p class="error">Couldn't load demo: {loadingError}</p>
		{:else if loadedComponent}
			{@const Demo = loadedComponent}
			<Demo />
		{:else}
			<p class="loading">Loading…</p>
		{/if}
	{:else}
		<Gallery items={galleryItems} {breadcrumb} onpick={pickGalleryItem} />
	{/if}
</ShowcaseCanvas>

<style>
	.back {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		padding: 6px 10px;
		background: transparent;
		border: none;
		@apply text-ink-z3;
		cursor: pointer;
		font: inherit;
	}
	.back:hover {
		@apply text-ink-z1;
	}
	.error,
	.loading {
		text-align: center;
		@apply text-ink-z3;
		padding: 48px;
	}
</style>
