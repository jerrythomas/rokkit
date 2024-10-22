<script>
	/**
	 * @typedef {Object} Props
	 * @property {any} [text]
	 * @property {string} [type]
	 */

	/** @type {Props} */
	let { text = null, type = 'error' } = $props();
</script>

{#if text}
	<message class={type}>
		{text}
	</message>
{/if}
