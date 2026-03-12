<script>
	import { Card } from '@rokkit/ui'
</script>

<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
	<Card>
		<h3 class="mb-2 text-lg font-semibold">Simple Card</h3>
		<p class="text-surface-z6">A basic card with text content.</p>
	</Card>

	<Card href="https://github.com" class="transition-shadow hover:shadow-lg">
		<h3 class="mb-2 text-lg font-semibold">Linked Card</h3>
		<p class="text-surface-z6">Click to navigate. Renders as an anchor tag.</p>
	</Card>

	<Card onclick={() => alert('Clicked!')}>
		<h3 class="mb-2 text-lg font-semibold">Clickable Card</h3>
		<p class="text-surface-z6">Card with click handler.</p>
	</Card>
</div>
