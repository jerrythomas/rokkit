<script>
	import 'uno.css'
	import '../app.css'
	import { themable } from '@rokkit/actions'
	import { vibe } from '@rokkit/states'

	let { children } = $props()
</script>

<svelte:body use:themable={{ theme: vibe, storageKey: 'rokkit-theme' }} />

{@render children?.()}
