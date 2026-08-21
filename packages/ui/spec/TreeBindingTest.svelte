<script lang="ts">
	/** Tree counterpart of ListBindingTest — same contract, same observability. */
	import Tree from '../src/components/Tree.svelte'

	let {
		items = [],
		initial = undefined,
		override = undefined
	}: {
		items?: unknown[]
		initial?: unknown
		override?: (value: unknown) => unknown
	} = $props()

	// Seeding from a prop on purpose — see ListBindingTest.
	// svelte-ignore state_referenced_locally
	let value = $state<unknown>(initial)
	let calls = $state<unknown[]>([])
</script>

<output data-bound-value>{String(value ?? '—')}</output>
<output data-select-log>{calls.map((c) => String(c)).join(',')}</output>

<Tree
	{items}
	bind:value
	onselect={(next) => {
		calls = [...calls, next]
		if (override) value = override(next)
	}}
/>
