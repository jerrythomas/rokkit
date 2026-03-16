<script>
	let { error, class: className = '' } = $props()
</script>

<div
	class="story-error rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-900/20 {className}"
>
	<div class="flex items-start space-x-3">
		<div class="flex-shrink-0">
			<svg class="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 18.5c-.77.833.192 2.5 1.732 2.5z"
				></path>
			</svg>
		</div>
		<div class="flex-1">
			<h3 class="text-sm font-medium text-red-900 dark:text-red-100">Story Loading Failed</h3>
			<p class="mt-1 text-sm text-red-800 dark:text-red-200">
				{error}
			</p>
		</div>
	</div>
</div>
