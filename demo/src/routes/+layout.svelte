<script>
	import 'uno.css'
	import '../app.css'
	import { vibe } from '@rokkit/states'
	import { theme } from '$lib/stores/theme.svelte'
	import { browser } from '$app/environment'
	import { untrack } from 'svelte'

	let { children } = $props()

	// The demo has two stores that need to stay aligned:
	//   - vibe (singleton from @rokkit/states) — what ThemeSwitcherToggle writes to
	//   - theme (demo-local) — owns persistence (localStorage 'rokkit-site') and writes
	//     body.dataset directly via its setters, and is what hooks.server.js's pre-paint
	//     script seeds from.
	// Bridge both directions so a toggle on any surface keeps both in step. The pre-paint
	// script handles FOUC prevention for the dataset; this just keeps vibe in sync with
	// whatever the script wrote.
	$effect(() => {
		if (!browser) return
		const m = theme.mode
		untrack(() => {
			if (vibe.mode !== m) vibe.mode = m
		})
	})

	$effect(() => {
		if (!browser) return
		const m = vibe.mode
		untrack(() => {
			if (theme.mode !== m) theme.setMode(m)
		})
	})
</script>

{@render children?.()}
