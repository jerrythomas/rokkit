<script>
	import 'uno.css'
	import '../app.css'
	import { themable } from '@rokkit/actions'
	import { vibe } from '@rokkit/states'

	// The library's `DEFAULT_STYLES` constant excludes zen-sumi/frosted
	// (they ship as optional themes, not in the default vocabulary), so
	// expand the allowed list before vibe can adopt them. `hooks.server.js`
	// injects the flash-prevention init script — that's the source of
	// truth for what the page initially paints in. Sync vibe to the
	// already-applied style so themable's reactive effect on mount doesn't
	// see a mismatch and trigger a second body-dataset write (visible
	// flicker between paint and hydration).
	vibe.allowedStyles = ['rokkit', 'minimal', 'material', 'frosted', 'zen-sumi']
	if (typeof document !== 'undefined') {
		const applied = document.documentElement.dataset.style || document.body?.dataset.style
		if (applied) vibe.style = applied
	}

	let { children } = $props()
</script>

<svelte:body use:themable={{ theme: vibe, storageKey: 'rokkit-theme' }} />

{@render children?.()}
