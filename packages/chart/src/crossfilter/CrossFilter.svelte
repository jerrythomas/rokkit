<script lang="ts">
	import { setContext, untrack } from 'svelte'
	import type { Snippet } from 'svelte'
	import { createCrossFilter } from './createCrossFilter.svelte.js'

	type CrossFilter = ReturnType<typeof createCrossFilter>
	type FilterState = CrossFilter['filters']

	type Props = {
		crossfilter?: CrossFilter
		mode?: 'dim' | 'hide'
		filters?: FilterState
		children?: Snippet
	}

	let {
		crossfilter: externalCf = undefined,
		mode = 'dim',
		filters = $bindable(),
		children
	}: Props = $props()

	// Use an externally provided instance (spec/helpers API) or create one internally.
	// untrack() suppresses "captures initial value" warning — intentional: the cf
	// instance is locked in at construction time and must not recreate on prop changes.
	const cf = untrack(() => externalCf ?? createCrossFilter())

	// Expose the reactive filters Map to callers via bind:filters
	$effect(() => {
		filters = cf.filters
	})

	setContext('crossfilter', cf)
	// Use a getter object so children can read .mode reactively
	const modeRef = {
		get mode() {
			return mode
		}
	}
	setContext('crossfilter-mode', modeRef)
</script>

<div data-crossfilter data-crossfilter-mode={mode}>
	{@render children?.()}
</div>
