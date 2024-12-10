<script>
	import { createBubbler } from 'svelte/legacy'

	const bubble = createBubbler()
	import DataEditor from './DataEditor.svelte'

	/**
	 * @typedef {Object} Props
	 * @property {any} value
	 * @property {any} [schema]
	 * @property {any} [layout]
	 * @property {any} [using]
	 * @property {import('svelte').Snippet} [children]
	 */

	/** @type {Props} */
	let { value = $bindable(), schema = null, layout = null, using = {}, children } = $props()
</script>

<form onsubmit={bubble('submit')}>
	<DataEditor bind:value {schema} {layout} {using} />
	<span>
		{#if children}{@render children()}{:else}
			<button type="submit">Submit</button>
		{/if}
	</span>
</form>
