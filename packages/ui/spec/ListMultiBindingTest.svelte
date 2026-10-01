<script lang="ts">
	/**
	 * Harness for List's multi-select `values`. The bound set and the onchange log are
	 * rendered into the DOM, so a spec observes both without reaching into internals. A
	 * button replaces the set from outside, as an owner would.
	 */
	import List from '../src/components/List.svelte'

	let { items = [], initial = [] }: { items?: unknown[]; initial?: unknown[] } = $props()

	// svelte-ignore state_referenced_locally
	let values = $state<unknown[]>(initial)
	let changes = $state<string[]>([])
</script>

<output data-bound-values>{values.map(String).join(',')}</output>
<output data-change-log>{changes.join('|')}</output>
<button type="button" data-set-outside onclick={() => (values = ['profile'])}>set</button>

<List {items} multiselect bind:values onchange={(next) => (changes = [...changes, next.map(String).join(',')])} />
