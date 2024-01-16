<script>
	import { PageNavigator } from '@rokkit/core'

	let className = ''
	export { className as class }
	export let content
	export let items
</script>

<div class="w-full h-full flex flex-col items-center justify-center text-white {className}">
	<span>{JSON.stringify(content)}</span>
	<PageNavigator {items} bind:value={content} />
</div>
