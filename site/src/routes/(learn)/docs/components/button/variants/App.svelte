<script>
	import { Button } from '@rokkit/ui'
</script>

<div class="space-y-6">
	<div>
		<h3 class="text-surface-z7 mb-2 text-sm font-semibold">Icon Buttons</h3>
		<div class="flex flex-wrap items-center gap-3">
			<Button icon="i-lucide:bold" />
			<Button icon="i-lucide:italic" />
			<Button icon="i-lucide:underline" />
			<Button icon="i-lucide:align-left" />
			<Button icon="i-lucide:align-center" />
			<Button icon="i-lucide:align-right" />
		</div>
	</div>

	<div>
		<h3 class="text-surface-z7 mb-2 text-sm font-semibold">With Right Icon</h3>
		<div class="flex flex-wrap items-center gap-3">
			<Button label="Save" icon="i-lucide:save" />
			<Button label="Download" iconRight="i-lucide:download" />
			<Button label="Upload" icon="i-lucide:upload" iconRight="i-lucide:chevron-right" />
		</div>
	</div>

	<div>
		<h3 class="text-surface-z7 mb-2 text-sm font-semibold">As Links</h3>
		<div class="flex flex-wrap items-center gap-3">
			<Button label="External Link" href="https://github.com" target="_blank" iconRight="i-lucide:share" />
		</div>
	</div>
</div>
