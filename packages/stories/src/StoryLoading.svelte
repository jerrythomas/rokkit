<script>
	let { message = 'Loading story...', class: className = '' } = $props()
</script>

<div class="story-loading border-surface-z2 bg-surface-z2 rounded-lg border p-6 {className}">
	<div class="flex items-center justify-center space-x-3">
		<div class="animate-spin">
			<svg
				class="text-surface-floating h-5 w-5"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
				></path>
			</svg>
		</div>
		<span class="text-surface-floating text-sm">{message}</span>
	</div>
</div>
