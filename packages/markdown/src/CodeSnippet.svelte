<script>
	import { highlight, languages } from 'prismjs'
	// import 'prism-svelte'

	export let code
	export let language
</script>

<code class="language-{language} font-mono">
	{@html highlight(code, languages[language], language)}
</code>
