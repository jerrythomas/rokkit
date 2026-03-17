<script>
	import { Button } from '@rokkit/ui'

	let clickCount = $state(0)
</script>

<div class="flex flex-wrap items-center gap-4">
	<Button label="Click me" onclick={() => clickCount++} />
	<Button label="With Icon" icon="i-glyph:star" onclick={() => clickCount++} />
	<Button label="Disabled" disabled />
	<Button label="Loading" loading />
</div>

<p class="text-surface-z7 mt-4">
	Click count: <strong>{clickCount}</strong>
</p>
