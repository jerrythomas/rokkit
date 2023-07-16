<script>
	import { marked } from 'marked'
	import { mangle } from 'marked-mangle'
	import { gfmHeadingId } from 'marked-gfm-heading-id'

	import 'prismjs'
	import 'prism-svelte'

	marked.use(mangle())
	marked.use(gfmHeadingId())

	export let content = ''
	$: preview = marked(content || '')
</script>

<article class="prose">
	{@html preview}
</article>
