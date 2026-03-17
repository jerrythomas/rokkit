<script>
	import { Button } from '@rokkit/ui'
</script>

<div class="space-y-6">
	<div>
		<h3 class="text-surface-z7 mb-2 text-sm font-semibold">Icon Buttons</h3>
		<div class="flex flex-wrap items-center gap-3">
			<Button icon="i-glyph:text-bold" />
			<Button icon="i-glyph:text-italic" />
			<Button icon="i-glyph:text-underline" />
			<Button icon="i-glyph:text-bold" />
			<Button icon="i-glyph:layers-minimalistic" />
			<Button icon="i-glyph:text-bold" />
		</div>
	</div>

	<div>
		<h3 class="text-surface-z7 mb-2 text-sm font-semibold">With Right Icon</h3>
		<div class="flex flex-wrap items-center gap-3">
			<Button label="Save" icon="i-glyph:diskette" />
			<Button label="Download" iconRight="i-glyph:download" />
			<Button label="Upload" icon="i-glyph:cloud-upload" iconRight="i-glyph:alt-arrow-right" />
		</div>
	</div>

	<div>
		<h3 class="text-surface-z7 mb-2 text-sm font-semibold">As Links</h3>
		<div class="flex flex-wrap items-center gap-3">
			<Button
				label="External Link"
				href="https://github.com"
				target="_blank"
				iconRight="i-glyph:share"
			/>
		</div>
	</div>
</div>
