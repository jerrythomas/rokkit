<script>
	import { ProgressBar } from '@rokkit/ui'

	let value = $state(65)
</script>

<div class="flex w-full max-w-md flex-col gap-6">
	<div>
		<p class="text-surface-z7 mb-2 text-sm">Progress: {value}%</p>
		<ProgressBar {value} />
	</div>

	<input type="range" min="0" max="100" bind:value />
</div>
