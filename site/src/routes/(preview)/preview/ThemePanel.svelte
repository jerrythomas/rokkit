<script>
	// @ts-nocheck
	import { Button, Card } from '@rokkit/ui'
	import { vibe } from '@rokkit/states'

	const skins = ['rokkit', 'glass', 'minimal', 'material']
	const modes = ['light', 'dark']

	let open = $state(false)
</script>

<div class="fixed right-6 bottom-6 z-50 flex flex-col items-end gap-2">
	{#if open}
		<Card class="w-56 shadow-lg">
			<div class="flex flex-col gap-4">
				<div>
					<p class="text-surface-z5 mb-2 text-xs font-semibold tracking-wide uppercase">Skin</p>
					<div class="flex flex-wrap gap-1">
						{#each skins as skin (skin)}
							<Button
								label={skin}
								size="sm"
								variant={vibe.style === skin ? 'primary' : 'default'}
								style={vibe.style === skin ? 'default' : 'ghost'}
								onclick={() => (vibe.style = skin)}
							/>
						{/each}
					</div>
				</div>
				<div>
					<p class="text-surface-z5 mb-2 text-xs font-semibold tracking-wide uppercase">Mode</p>
					<div class="flex gap-1">
						{#each modes as mode (mode)}
							<Button
								label={mode}
								size="sm"
								class="flex-1"
								variant={vibe.mode === mode ? 'primary' : 'default'}
								style={vibe.mode === mode ? 'default' : 'ghost'}
								onclick={() => (vibe.mode = mode)}
							/>
						{/each}
					</div>
				</div>
			</div>
		</Card>
	{/if}
	<Button
		icon="i-glyph:palette"
		variant="primary"
		onclick={() => (open = !open)}
		aria-label="Toggle theme panel"
		aria-expanded={open}
	/>
</div>
