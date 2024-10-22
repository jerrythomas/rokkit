<script>
	import { PageNavigator } from '@rokkit/core'

	
	/**
	 * @typedef {Object} Props
	 * @property {string} [class]
	 * @property {any} content
	 * @property {any} items
	 */

	/** @type {Props} */
	let { class: className = '', content = $bindable(), items } = $props();
</script>

<div class="w-full h-full flex flex-col items-center justify-center text-white {className}">
	<span>{JSON.stringify(content)}</span>
	<PageNavigator {items} bind:value={content} />
</div>
