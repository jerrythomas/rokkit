<script>
	import { createBubbler } from 'svelte/legacy';

	const bubble = createBubbler();
	import { marked } from 'marked'
	import { mangle } from 'marked-mangle'
	import { gfmHeadingId } from 'marked-gfm-heading-id'
	import { fillable } from '@rokkit/actions'

	/**
	 * @typedef {Object} Props
	 * @property {string} [text]
	 * @property {any} [options]
	 * @property {number} [current]
	 * @property {boolean} [check]
	 */

	/** @type {Props} */
	let {
		text = '',
		options = [],
		current = 0,
		check = false
	} = $props();

	marked.use(mangle())
	marked.use(gfmHeadingId())

	let parsed = $derived(marked(text))
</script>

<div use:fillable={{ options, current, check }} onremove={bubble('remove')} class="flex-grow">
	{@html parsed}
</div>
