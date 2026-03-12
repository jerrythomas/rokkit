<script>
	// @ts-nocheck
	import { LazyTree } from '@rokkit/ui'
	import { InfoField } from '@rokkit/forms'
	import PlaySection from '$lib/components/PlaySection.svelte'

	// --- Lazy Load Children Demo ---
	let selected = $state(undefined)

	const lazyTree = [
		{ label: 'Documents', value: 'docs', icon: 'i-lucide:folder', children: true },
		{ label: 'Pictures', value: 'pics', icon: 'i-lucide:folder', children: true },
		{ label: 'notes.txt', value: 'notes', icon: 'i-lucide:file-text' }
	]

	async function handleLazyLoad(item) {
		await new Promise((r) => setTimeout(r, 800))
		if (item.value === 'docs') {
			return [
				{ label: 'Resume.pdf', value: 'resume', icon: 'i-lucide:file-text' },
				{
					label: 'Projects',
					value: 'projects',
					icon: 'i-lucide:folder',
					children: true
				}
			]
		}
		if (item.value === 'pics') {
			return [
				{ label: 'vacation.jpg', value: 'vacation', icon: 'i-lucide:image' },
				{ label: 'profile.png', value: 'profile', icon: 'i-lucide:image' }
			]
		}
		if (item.value === 'projects') {
			return [
				{ label: 'rokkit/', value: 'rokkit', icon: 'i-lucide:folder-open' },
				{ label: 'notes.md', value: 'proj-notes', icon: 'i-lucide:file-text' }
			]
		}
		return []
	}

	// --- Load More (hasMore) Demo ---
	let selected2 = $state(undefined)
	let hasMore = $state(true)
	let batch = $state(0)

	const initialItems = [
		{ label: 'Alpha', value: 'alpha', icon: 'i-lucide:file' },
		{ label: 'Bravo', value: 'bravo', icon: 'i-lucide:file' },
		{ label: 'Charlie', value: 'charlie', icon: 'i-lucide:file' }
	]

	let paginatedItems = $state([...initialItems])

	const batches = [
		[
			{ label: 'Delta', value: 'delta', icon: 'i-lucide:file' },
			{ label: 'Echo', value: 'echo', icon: 'i-lucide:file' },
			{ label: 'Foxtrot', value: 'foxtrot', icon: 'i-lucide:file' }
		],
		[
			{ label: 'Golf', value: 'golf', icon: 'i-lucide:file' },
			{ label: 'Hotel', value: 'hotel', icon: 'i-lucide:file' }
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
