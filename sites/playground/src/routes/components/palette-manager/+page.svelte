<script lang="ts">
	import { PaletteManager } from '@rokkit/ui'
	import Playground from '$lib/Playground.svelte'
</script>

<Playground
	title="PaletteManager"
	description="Interactive color palette editor for managing theme color values."
>
	{#snippet preview()}
		<PaletteManager />
	{/snippet}
</Playground>
