<script>
	import { createBubbler } from 'svelte/legacy'

	const bubble = createBubbler()
	/**
	 * @typedef {Object} Props
	 * @property {import('svelte').Snippet} [children]
	 */

	/** @type {Props} */
	let { children } = $props()
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<overlay
	class="absolute left-0 top-0 h-screen w-screen"
	role="presentation"
	aria-hidden="true"
	onclick={bubble('click')}
>
	{@render children?.()}
</overlay>
