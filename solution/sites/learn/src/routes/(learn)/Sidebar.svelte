<script>
	import { List } from '@rokkit/ui'
	import { page } from '$app/state'

	/** @type {{ sections: any[], fields: Object }} */
	let { sections, fields } = $props()

	let query = $state('')
	let searchInput = $state(null)

	let filtered = $derived.by(() => {
		const q = query.trim().toLowerCase()
		if (!q) return sections

		return sections.flatMap((item) => {
			// Guide items (no children) — match against title
			if (!item.children) {
				return item.title?.toLowerCase().includes(q) ? [item] : []
			}
			// Group items — filter children, keep group if any match
			const matchingChildren = item.children.filter(
				(child) =>
					child.title?.toLowerCase().includes(q) ||
					child.description?.toLowerCase().includes(q)
			)
			if (matchingChildren.length > 0) {
				return [{ ...item, children: matchingChildren }]
			}
			// Also match group title itself
			if (item.title?.toLowerCase().includes(q)) {
				return [item]
			}
			return []
		})
	})

	export function focusSearch() {
		searchInput?.focus()
		searchInput?.select()
	}
</script>

<div class="flex flex-col min-h-0 w-full flex-1">
	<div class="px-3 pt-3 pb-1">
		<div class="relative">
			<span class="i-solar:magnifer-bold-duotone absolute left-2.5 top-1/2 -translate-y-1/2 text-surface-z4 text-sm pointer-events-none" aria-hidden="true"></span>
			<input
				bind:this={searchInput}
				bind:value={query}
				type="text"
				placeholder="Search..."
				class="w-full rounded-md border border-surface-z2 bg-surface-z1 py-1.5 pl-8 pr-8 text-sm text-surface-z7 placeholder:text-surface-z4 focus:border-primary-z5 focus:outline-none"
				aria-label="Search documentation"
			/>
			{#if !query}
				<kbd class="absolute right-2 top-1/2 -translate-y-1/2 rounded border border-surface-z2 bg-surface-z1 px-1.5 py-0.5 text-[0.625rem] text-surface-z4 font-mono">⌘K</kbd>
			{:else}
				<button
					class="absolute right-2 top-1/2 -translate-y-1/2 text-surface-z4 hover:text-surface-z7 text-sm"
					onclick={() => (query = '')}
					aria-label="Clear search"
				>
					<span class="i-solar:close-circle-bold-duotone inline-block" aria-hidden="true"></span>
				</button>
			{/if}
		</div>
	</div>
	<List items={filtered} {fields} value={page.url.pathname} collapsible class="w-full flex-1 min-h-0 overflow-y-auto" />
</div>
