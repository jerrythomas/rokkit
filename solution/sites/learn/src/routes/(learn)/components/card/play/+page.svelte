<script>
	// @ts-nocheck
	import { Card } from '@rokkit/ui'
	import PlaySection from '$lib/components/PlaySection.svelte'
</script>

<PlaySection>
	{#snippet preview()}
		<div class="flex flex-wrap gap-6 p-8 items-start">
			<Card class="w-64">
				{#snippet header()}
					<h3 class="text-lg font-semibold">Basic Card</h3>
				{/snippet}
				<p class="text-sm text-surface-z5">This is a simple card with header and body content.</p>
			</Card>

			<Card class="w-64" href="/components/card">
				{#snippet header()}
					<h3 class="text-lg font-semibold">Link Card</h3>
				{/snippet}
				<p class="text-sm text-surface-z5">Click this card to navigate.</p>
				{#snippet footer()}
					<span class="text-xs text-surface-z4">Go to Card page →</span>
				{/snippet}
			</Card>

			<Card class="w-64" onclick={() => console.log('clicked!')}>
				{#snippet header()}
					<div class="flex items-center gap-2">
						<span class="i-lucide:mouse-pointer-click text-xl"></span>
						<h3 class="text-lg font-semibold">Clickable Card</h3>
					</div>
				{/snippet}
				<p class="text-sm text-surface-z5">This card has an onclick handler.</p>
			</Card>
		</div>
	{/snippet}
</PlaySection>
