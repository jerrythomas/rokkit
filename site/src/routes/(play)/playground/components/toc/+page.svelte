<script>
	// @ts-nocheck
	import { TableOfContents } from '@rokkit/app'
	import PlaySection from '$lib/components/PlaySection.svelte'
</script>

<PlaySection>
	{#snippet preview()}
		<div class="flex h-full w-full gap-6">
			<!-- Sample content with headings -->
			<div id="toc-demo-content" class="flex-1 overflow-y-auto p-4 text-sm leading-relaxed">
				<h2 class="text-surface-z9 mb-2 text-base font-semibold">Introduction</h2>
				<p class="text-surface-z6 mb-4">
					This is a demonstration of the TableOfContents component. It scans the container for h2
					and h3 headings and renders a navigable list. Scroll the content to see the active heading
					update.
				</p>

				<h2 class="text-surface-z9 mb-2 text-base font-semibold">Getting Started</h2>
				<p class="text-surface-z6 mb-4">
					Pass the <code class="bg-surface-z1 rounded px-1 text-xs">container</code> prop with the
					ID of the element whose headings you want to track. The component mounts an
					IntersectionObserver to detect which heading is currently in view.
				</p>

				<h3 class="text-surface-z9 mb-2 text-sm font-semibold">Installation</h3>
				<p class="text-surface-z6 mb-4">
					Import from <code class="bg-surface-z1 rounded px-1 text-xs">@rokkit/app</code>. The
					component auto-scans on mount and assigns IDs to any headings that don't have one.
				</p>

				<h3 class="text-surface-z9 mb-2 text-sm font-semibold">Configuration</h3>
				<p class="text-surface-z6 mb-4">
					The component only renders when there are two or more headings. It supports keyboard
					navigation — use arrow keys to move between items and Enter/Space to scroll to a heading.
				</p>

				<h2 class="text-surface-z9 mb-2 text-base font-semibold">Keyboard Navigation</h2>
				<p class="text-surface-z6 mb-4">
					The TOC is keyboard-accessible using the <code
						class="bg-surface-z1 rounded px-1 text-xs">navigable</code
					> action. Arrow up/down cycles through headings; Enter selects and scrolls.
				</p>

				<h2 class="text-surface-z9 mb-2 text-base font-semibold">Theming</h2>
				<p class="text-surface-z6 mb-4">
					The component uses <code class="bg-surface-z1 rounded px-1 text-xs">data-toc</code>,
					<code class="bg-surface-z1 rounded px-1 text-xs">data-toc-item</code>, and
					<code class="bg-surface-z1 rounded px-1 text-xs">data-toc-active</code> attributes. Theme
					styles live in <code class="bg-surface-z1 rounded px-1 text-xs"
						>packages/themes/src/*/toc.css</code
					>.
				</p>

				<h3 class="text-surface-z9 mb-2 text-sm font-semibold">Active State</h3>
				<p class="text-surface-z6 mb-4">
					The active heading is tracked via IntersectionObserver. Clicking a TOC item scrolls the
					content smoothly and locks the active state for 1 second to prevent flicker.
				</p>

				<h2 class="text-surface-z9 mb-2 text-base font-semibold">API Reference</h2>
				<p class="text-surface-z6 mb-4">
					<strong>Props:</strong>
					<code class="bg-surface-z1 rounded px-1 text-xs">container</code> — string, ID of the element
					to scan (default: <code class="bg-surface-z1 rounded px-1 text-xs">'main-content'</code>).
				</p>
				<p class="text-surface-z6 mb-4">
					<strong>Methods:</strong>
					<code class="bg-surface-z1 rounded px-1 text-xs">rescan()</code> — re-scans the container
					for headings (useful after dynamic content changes).
				</p>
			</div>

			<!-- TOC sidebar -->
			<div class="w-44 shrink-0">
				<TableOfContents container="toc-demo-content" />
			</div>
		</div>
	{/snippet}
</PlaySection>
