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
					child.title?.toLowerCase().includes(q) || child.description?.toLowerCase().includes(q)
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

<div class="flex min-h-0 w-full flex-1 flex-col">
	<div class="px-3 pt-3 pb-1">
		<div class="relative">
			<span
				class="i-glyph:magnifer text-surface-z4 pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-sm"
				aria-hidden="true"
			></span>
			<input
				bind:this={searchInput}
				bind:value={query}
				type="text"
				placeholder="Search..."
				class="border-surface-z2 bg-surface-z1 text-surface-z7 placeholder:text-surface-z4 focus:border-primary-z5 w-full rounded-md border py-1.5 pr-8 pl-8 text-sm focus:outline-none"
				aria-label="Search documentation"
			/>
			{#if !query}
				<kbd
					class="border-surface-z2 bg-surface-z1 text-surface-z4 absolute top-1/2 right-2 -translate-y-1/2 rounded border px-1.5 py-0.5 font-mono text-[0.625rem]"
					>⌘K</kbd
				>
			{:else}
				<button
					class="text-surface-z4 hover:text-surface-z7 absolute top-1/2 right-2 -translate-y-1/2 text-sm"
					onclick={() => (query = '')}
					aria-label="Clear search"
				>
					<span class="i-glyph:close-circle inline-block" aria-hidden="true"></span>
				</button>
			{/if}
		</div>
	</div>
	<List
		items={filtered}
		{fields}
		value={page.url.pathname}
		collapsible
		class="min-h-0 w-full flex-1 overflow-y-auto"
	/>
</div>
