<script>
	// @ts-nocheck
	import { LazyTree } from '@rokkit/ui'
	import { InfoField } from '@rokkit/forms'
	import PlaySection from '$lib/components/PlaySection.svelte'

	// --- Lazy Load Children Demo ---
	let selected = $state(undefined)

	const lazyTree = [
		{ text: 'Documents', value: 'docs', icon: 'i-lucide:folder', children: true },
		{ text: 'Pictures', value: 'pics', icon: 'i-lucide:folder', children: true },
		{ text: 'notes.txt', value: 'notes', icon: 'i-lucide:file-text' }
	]

	async function handleLazyLoad(item) {
		await new Promise((r) => setTimeout(r, 800))
		if (item.value === 'docs') {
			return [
				{ text: 'Resume.pdf', value: 'resume', icon: 'i-lucide:file-text' },
				{
					text: 'Projects',
					value: 'projects',
					icon: 'i-lucide:folder',
					children: true
				}
			]
		}
		if (item.value === 'pics') {
			return [
				{ text: 'vacation.jpg', value: 'vacation', icon: 'i-lucide:image' },
				{ text: 'profile.png', value: 'profile', icon: 'i-lucide:image' }
			]
		}
		if (item.value === 'projects') {
			return [
				{ text: 'rokkit/', value: 'rokkit', icon: 'i-lucide:folder-open' },
				{ text: 'notes.md', value: 'proj-notes', icon: 'i-lucide:file-text' }
			]
		}
		return []
	}

	// --- Load More (hasMore) Demo ---
	let selected2 = $state(undefined)
	let hasMore = $state(true)
	let batch = $state(0)

	const initialItems = [
		{ text: 'Alpha', value: 'alpha', icon: 'i-lucide:file' },
		{ text: 'Bravo', value: 'bravo', icon: 'i-lucide:file' },
		{ text: 'Charlie', value: 'charlie', icon: 'i-lucide:file' }
	]

	let paginatedItems = $state([...initialItems])

	const batches = [
		[
			{ text: 'Delta', value: 'delta', icon: 'i-lucide:file' },
			{ text: 'Echo', value: 'echo', icon: 'i-lucide:file' },
			{ text: 'Foxtrot', value: 'foxtrot', icon: 'i-lucide:file' }
		],
		[
			{ text: 'Golf', value: 'golf', icon: 'i-lucide:file' },
			{ text: 'Hotel', value: 'hotel', icon: 'i-lucide:file' }
		]
	]

	async function handleLoadMore(item) {
		await new Promise((r) => setTimeout(r, 500))
		if (!item) {
			// Root-level "Load More" — return next batch
			const nextBatch = batches[batch] || []
			batch++
			if (batch >= batches.length) hasMore = false
			return nextBatch
		}
		return []
	}
</script>

<PlaySection>
	{#snippet preview()}
		<div class="max-w-[320px]">
			<LazyTree
				items={lazyTree}
				value={selected}
				onselect={(v) => (selected = v)}
				onlazyload={handleLazyLoad}
			/>
		</div>
	{/snippet}

	{#snippet controls()}
		<InfoField label="Selected" value={selected} />
	{/snippet}
</PlaySection>

<PlaySection>
	{#snippet preview()}
		<div class="max-w-[320px]">
			<LazyTree
				items={paginatedItems}
				value={selected2}
				onselect={(v) => (selected2 = v)}
				onlazyload={handleLoadMore}
				{hasMore}
			/>
		</div>
	{/snippet}

	{#snippet controls()}
		<InfoField label="Selected" value={selected2} />
		<InfoField label="Has More" value={hasMore} />
		<InfoField label="Batch" value={batch} />
	{/snippet}
</PlaySection>
