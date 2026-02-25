<script>
	import { ProgressBar } from '@rokkit/ui'
</script>

<div class="flex w-full max-w-md flex-col gap-6">
	<div>
		<p class="text-surface-z7 mb-2 text-sm">Indeterminate (loading)</p>
		<ProgressBar />
	</div>

	<div>
		<p class="text-surface-z7 mb-2 text-sm">Determinate (75%)</p>
		<ProgressBar value={75} />
	</div>

	<div>
		<p class="text-surface-z7 mb-2 text-sm">Complete (100%)</p>
		<ProgressBar value={100} />
	</div>
</div>
