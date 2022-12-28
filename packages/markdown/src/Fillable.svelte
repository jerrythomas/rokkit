<script>
	import { marked } from 'marked'
	import { fillable } from '@rokkit/core/actions'

	export let text = ''
	export let options = []
	export let current = 0
	export let check = false

	$: parsed = marked(text)
</script>

<div use:fillable={{ options, current, check }} on:remove class="flex-grow">
	{@html parsed}
</div>

<style lang="postcss">
	/* :global(del) {
		@apply no-underline px-2 py-1 rounded cursor-pointer;
	}
	:global(.empty) {
		@apply bg-accent-300;
	}
	:global(.filled) {
		@apply bg-info-200 text-info-600;
	}
	:global(.pass) {
		@apply bg-pass-200 text-pass-600;
	}
	:global(.fail) {
		@apply bg-fail-200 text-fail-600;
	} */
</style>
