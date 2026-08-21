<script lang="ts">
	/**
	 * Harness for List's two-way `value`. The bound value and the onselect call
	 * log are rendered into the DOM so a spec can observe both without reaching
	 * into component internals.
	 *
	 * `override` lets a test simulate a consumer that assigns its OWN value inside
	 * onselect — the case that proves List writes before it notifies, so the
	 * consumer's assignment is the one that survives.
	 */
	import List from '../src/components/List.svelte'

	let {
		items = [],
		collapsible = false,
		initial = undefined,
		override = undefined
	}: {
		items?: unknown[]
		collapsible?: boolean
		initial?: unknown
		override?: (value: unknown) => unknown
	} = $props()

	// Seeding from a prop on purpose — `initial` is a starting value, not a
	// live binding, so capturing it once is the intent.
	// svelte-ignore state_referenced_locally
	let value = $state<unknown>(initial)
	let calls = $state<unknown[]>([])
	// Counts how often the bound value actually CHANGED, so a test can prove a
	// redundant re-selection does not publish a new value.
	let writes = $state(0)
	// svelte-ignore state_referenced_locally
	let previous: unknown = initial

	$effect(() => {
		if (value !== previous) {
			previous = value
			writes += 1
		}
	})
</script>

<output data-bound-value>{String(value ?? '—')}</output>
<output data-select-log>{calls.map((c) => String(c)).join(',')}</output>
<output data-write-count>{writes}</output>

<List
	{items}
	{collapsible}
	bind:value
	onselect={(next) => {
		calls = [...calls, next]
		if (override) value = override(next)
	}}
/>
