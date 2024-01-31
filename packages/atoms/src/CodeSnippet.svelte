<script>
	import * as Prism from 'prismjs'
  import 'prism-svelte'

	let className = ''
	export { className as class }
	export let code
	export let language

	$: parsed = Prism.highlight(code, Prism.languages[language], language)
</script>

<pre class="language-{language} {className}"><code>{@html parsed}</code></pre>
