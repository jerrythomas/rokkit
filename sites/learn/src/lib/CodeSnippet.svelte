<script>
	import * as Prism from 'prismjs'
	import 'prism-svelte'

	/**
	 * @typedef {Object} Props
	 * @property {string} [class]
	 * @property {string} code
	 * @property {string} language
	 */

	/** @type {Props} */
	let { class: className = '', code, language } = $props()

	let parsed = $derived(Prism.highlight(code, Prism.languages[language], language))
</script>

<pre class="language-{language} {className}"><code>{@html parsed}</code></pre>
