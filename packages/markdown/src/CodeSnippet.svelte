<script>
	import * as prism from 'prismjs'
	// import 'prism-svelte'

	export let code
	export let language

	$: parsed = prism.highlight(code, prism.languages[language], language)
</script>

<pre class="language-{language} w-full"><code>{@html parsed}</code></pre>
