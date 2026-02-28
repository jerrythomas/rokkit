<script>
	import { Card } from '@rokkit/ui'
</script>

<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
	<Card>
		{#snippet header()}
			<div class="flex items-center gap-2">
				<span class="i-lucide:user text-lg" aria-hidden="true"></span>
				<h3 class="font-semibold">Profile</h3>
			</div>
		{/snippet}

		<p class="text-surface-z6">Card body content with header and footer snippets.</p>

		{#snippet footer()}
			<div class="flex justify-end gap-2">
				<button class="text-sm text-blue-500">Edit</button>
				<button class="text-sm text-blue-500">View</button>
			</div>
		{/snippet}
	</Card>

	<Card>
		{#snippet header()}
			<div class="flex items-center gap-2">
				<span class="i-lucide:bell text-lg" aria-hidden="true"></span>
				<h3 class="font-semibold">Notifications</h3>
				<span class="ml-auto rounded-full bg-red-500 px-2 py-0.5 text-xs text-white">3</span>
			</div>
		{/snippet}

		<ul class="text-surface-z6 space-y-2 text-sm">
			<li>New message from Alice</li>
			<li>Build completed successfully</li>
			<li>PR #42 was merged</li>
		</ul>
	</Card>
</div>
