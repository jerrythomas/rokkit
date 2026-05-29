<script>
	// @ts-nocheck
	import { LazyTree } from '@rokkit/ui'
	import { InfoField } from '@rokkit/forms'
	import PlaySection from '$lib/components/PlaySection.svelte'

	// --- Lazy Load Children Demo ---
	let selected = $state(undefined)

	const lazyTree = [
		{ label: 'Documents', value: 'docs', icon: 'i-glyph:folder', children: true },
		{ label: 'Pictures', value: 'pics', icon: 'i-glyph:folder', children: true },
		{ label: 'notes.txt', value: 'notes', icon: 'i-glyph:file-text' }
	]

	async function handleLazyLoad(item) {
		await new Promise((r) => setTimeout(r, 800))
		if (item.value === 'docs') {
			return [
				{ label: 'Resume.pdf', value: 'resume', icon: 'i-glyph:file-text' },
				{
					label: 'Projects',
					value: 'projects',
					icon: 'i-glyph:folder',
					children: true
				}
			]
		}
		if (item.value === 'pics') {
			return [
				{ label: 'vacation.jpg', value: 'vacation', icon: 'i-glyph:gallery' },
				{ label: 'profile.png', value: 'profile', icon: 'i-glyph:gallery' }
			]
		}
		if (item.value === 'projects') {
			return [
				{ label: 'rokkit/', value: 'rokkit', icon: 'i-glyph:folder-open' },
				{ label: 'notes.md', value: 'proj-notes', icon: 'i-glyph:file-text' }
			]
		}
		return []
	}

	// --- Load More (hasMore) Demo ---
	let selected2 = $state(undefined)
	let hasMore = $state(true)
	let batch = $state(0)

	const initialItems = [
		{ label: 'Alpha', value: 'alpha', icon: 'i-glyph:file' },
		{ label: 'Bravo', value: 'bravo', icon: 'i-glyph:file' },
		{ label: 'Charlie', value: 'charlie', icon: 'i-glyph:file' }
	]

	let paginatedItems = $state([...initialItems])

	const batches = [
		[
			{ label: 'Delta', value: 'delta', icon: 'i-glyph:file' },
			{ label: 'Echo', value: 'echo', icon: 'i-glyph:file' },
			{ label: 'Foxtrot', value: 'foxtrot', icon: 'i-glyph:file' }
		],
		[
			{ label: 'Golf', value: 'golf', icon: 'i-glyph:file' },
			{ label: 'Hotel', value: 'hotel', icon: 'i-glyph:file' }
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
		<div class="flex gap-8">
			<div class="max-w-[280px]">
				<p class="text-surface-z5 mb-2 text-xs font-semibold tracking-widest uppercase">
					Lazy Load
				</p>
				<LazyTree
					items={lazyTree}
					value={selected}
					onselect={(v) => (selected = v)}
					onlazyload={handleLazyLoad}
				/>
			</div>
			<div class="max-w-[280px]">
				<p class="text-surface-z5 mb-2 text-xs font-semibold tracking-widest uppercase">
					Load More
				</p>
				<LazyTree
					items={paginatedItems}
					value={selected2}
					onselect={(v) => (selected2 = v)}
					onlazyload={handleLoadMore}
					{hasMore}
				/>
			</div>
		</div>
	{/snippet}

	{#snippet controls()}
		<InfoField label="Selected" value={selected} />
		<InfoField label="Selected 2" value={selected2} />
		<InfoField label="Has More" value={hasMore} />
		<InfoField label="Batch" value={batch} />
	{/snippet}
</PlaySection>
