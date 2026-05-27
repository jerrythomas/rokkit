<script>
	import 'uno.css'
	import '../app.css'
	import { themable } from '@rokkit/actions'
	import { vibe } from '@rokkit/states'

	// Demo's canonical aesthetic is zen-sumi (ink on paper). The library's
	// `DEFAULT_STYLES` constant excludes zen-sumi/frosted (they ship as
	// optional themes, not in the default vocabulary), so expand the allowed
	// list before setting the style — otherwise vibe's setter silently
	// rejects the assignment and the demo lands on `rokkit`.
	//
	// themable's `load()` runs after this and respects any persisted choice
	// in localStorage['rokkit-theme'], so returning users keep what they set.
	vibe.allowedStyles = ['rokkit', 'minimal', 'material', 'frosted', 'zen-sumi']
	vibe.style = 'zen-sumi'

	let { children } = $props()
</script>

<svelte:body use:themable={{ theme: vibe, storageKey: 'rokkit-theme' }} />

{@render children?.()}
