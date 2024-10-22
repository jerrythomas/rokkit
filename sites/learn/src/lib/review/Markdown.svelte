<script>
	import { marked } from 'marked'
	import { mangle } from 'marked-mangle'
	import { gfmHeadingId } from 'marked-gfm-heading-id'

	import 'prismjs'
	// import 'prism-svelte'

	marked.use(mangle())
	marked.use(gfmHeadingId())

	/**
	 * @typedef {Object} Props
	 * @property {string} [content]
	 */

	/** @type {Props} */
	let { content = '' } = $props();
	let preview = $derived(marked(content || ''))
</script>

<article class="prose">
	{@html preview}
</article>
