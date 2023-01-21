<script>
	import * as prism from 'prismjs'
	// import 'prism-svelte'

	export let code
	export let language

	$: parsed = prism.highlight(code, prism.languages[language], language)
</script>

<code class="language-{language} font-mono">
	{@html parsed}
</code>
