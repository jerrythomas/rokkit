<script>
	// @ts-nocheck
	import { Toolbar, Button, Dropdown } from '@rokkit/ui'
	import { page } from '$app/state'
	import { theme } from '$lib/theme.svelte'

	let { preview, controls, data: dataSnippet } = $props()

	const themeItems = [
		{ label: 'rokkit', value: 'rokkit' },
		{ label: 'minimal', value: 'minimal' },
		{ label: 'material', value: 'material' },
		{ label: 'glass', value: 'glass' },
		{ label: 'grada-ui', value: 'grada-ui' }
	]
	let showControls = $state(false)
	let showData = $state(false)

	const slug = $derived(page.url.pathname.split('/').pop())
	const isComponent = $derived(page.url.pathname.includes('/playground/components/'))
	const isEffect = $derived(page.url.pathname.includes('/playground/effects/'))
	const docsHref = $derived(
		isComponent ? `/docs/components/${slug}` : isEffect ? `/docs/effects/${slug}` : null
	)
	const llmsHref = $derived(isComponent ? `/llms/components/${slug}.txt` : null)
</script>

<div class="flex h-full flex-col overflow-hidden">
	<div class="flex min-h-0 flex-1 overflow-hidden">
		<!-- Preview area -->
		<div class="preview-area relative min-h-0 flex-1" data-style={theme.name}>
			<!-- Inner overflow container keeps preview content clipped without affecting the Dropdown panel -->
			<div class="absolute inset-0 overflow-hidden">
				<div class="flex h-full items-center justify-center overflow-auto p-10">
					{@render preview()}
				</div>
			</div>

			<!-- Toolbar — inherits theme from preview-area's data-style -->
			<Toolbar size="sm" width="fit" class="absolute top-3 right-3 z-30 rounded-lg">
				{#if docsHref}
					<a href={docsHref} data-toolbar-item title="View Documentation" aria-label="View Documentation">
						<span class="i-solar:book-2-bold-duotone" data-toolbar-icon aria-hidden="true"></span>
					</a>
				{/if}

				{#if llmsHref}
					<a
						href={llmsHref}
						target="_blank"
						rel="noopener noreferrer"
						data-toolbar-item
						title="View llms.txt"
						aria-label="View llms.txt"
					>
						<span class="i-solar:file-text-bold-duotone" data-toolbar-icon aria-hidden="true"></span>
					</a>
				{/if}

				{#if docsHref || llmsHref}
					<div data-toolbar-separator role="separator" aria-orientation="vertical"></div>
				{/if}

				{#if controls}
					<button
						type="button"
						data-toolbar-item
						data-active={showControls || undefined}
						aria-pressed={showControls}
						title="Toggle Properties"
						onclick={() => (showControls = !showControls)}
					>
						<span class="i-solar:settings-bold-duotone" data-toolbar-icon aria-hidden="true"></span>
					</button>
				{/if}

				{#if dataSnippet}
					<button
						type="button"
						data-toolbar-item
						data-active={showData || undefined}
						aria-pressed={showData}
						title="Toggle Data"
						onclick={() => (showData = !showData)}
					>
						<span class="i-solar:database-bold-duotone" data-toolbar-icon aria-hidden="true"></span>
					</button>
				{/if}

				{#if controls || dataSnippet}
					<div data-toolbar-separator role="separator" aria-orientation="vertical"></div>
				{/if}

				<!-- Style dropdown -->
				<Dropdown
					items={themeItems}
					bind:value={theme.name}
					icon="i-solar:palette-bold-duotone"
					size="sm"
					align="end"
				/>
			</Toolbar>
		</div>

		<!-- Right panel: properties and/or data -->
		{#if (showControls && controls) || (showData && dataSnippet)}
			<div class="border-surface-z2 bg-surface-z1 flex w-72 flex-shrink-0 flex-col border-l">
				{#if showControls && controls}
					<div class="border-surface-z2 flex items-center justify-between border-b px-4 py-2">
						<p class="text-surface-z5 text-[10px] font-semibold uppercase tracking-widest">Properties</p>
						<Button
							icon="i-solar:close-circle-bold-duotone"
							style="ghost"
							size="sm"
							aria-label="Close properties"
							onclick={() => (showControls = false)}
						/>
					</div>
					<div class="flex flex-col gap-3 overflow-y-auto p-4 {showData && dataSnippet ? 'border-surface-z2 border-b' : 'flex-1'}">
						{@render controls()}
					</div>
				{/if}

				{#if showData && dataSnippet}
					<div class="border-surface-z2 flex items-center justify-between border-b px-4 py-2">
						<p class="text-surface-z5 text-[10px] font-semibold uppercase tracking-widest">Data</p>
						<Button
							icon="i-solar:close-circle-bold-duotone"
							style="ghost"
							size="sm"
							aria-label="Close data panel"
							onclick={() => (showData = false)}
						/>
					</div>
					<div class="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
						{@render dataSnippet()}
					</div>
				{/if}
			</div>
		{/if}
	</div>
</div>
