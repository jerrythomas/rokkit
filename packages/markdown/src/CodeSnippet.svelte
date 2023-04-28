<script>
	import * as prism from 'prismjs'

	let className
	export { className as class }
	export let code
	export let language

	$: parsed = prism.highlight(code, prism.languages[language], language)
</script>

<pre class="language-{language} {className}"><code>{@html parsed}</code></pre>
