<script>
	// @ts-nocheck
	import { Card } from '@rokkit/ui'
	import PlaySection from '$lib/components/PlaySection.svelte'
</script>

<PlaySection>
	{#snippet preview()}
		<div class="flex flex-wrap items-start gap-6 p-8">
			<Card class="w-64">
				{#snippet header()}
					<h3 class="text-lg font-semibold">Basic Card</h3>
				{/snippet}
				<p class="text-surface-z5 text-sm">This is a simple card with header and body content.</p>
			</Card>

			<Card class="w-64" href="/components/card">
				{#snippet header()}
					<h3 class="text-lg font-semibold">Link Card</h3>
				{/snippet}
				<p class="text-surface-z5 text-sm">Click this card to navigate.</p>
				{#snippet footer()}
					<span class="text-surface-z4 text-xs">Go to Card page →</span>
				{/snippet}
			</Card>

			<Card class="w-64" onclick={() => console.log('clicked!')}>
				{#snippet header()}
					<div class="flex items-center gap-2">
						<span class="i-glyph:cursor text-xl"></span>
						<h3 class="text-lg font-semibold">Clickable Card</h3>
					</div>
				{/snippet}
				<p class="text-surface-z5 text-sm">This card has an onclick handler.</p>
			</Card>
		</div>
	{/snippet}
</PlaySection>
