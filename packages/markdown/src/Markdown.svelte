<script>
	import { marked } from 'marked'
	import 'prismjs'
	import 'prism-svelte'

	export let content = ''
	$: preview = marked(content || '')
</script>

<article class="prose">
	{@html preview}
</article>

<!-- <style>
	@import url('./prism.css');


</style> -->
