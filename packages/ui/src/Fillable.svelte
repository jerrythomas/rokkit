<script>
	import { marked } from 'marked'
	import { mangle } from 'marked-mangle'
	import { gfmHeadingId } from 'marked-gfm-heading-id'
	import { fillable } from '@rokkit/actions'

	export let text = ''
	export let options = []
	export let current = 0
	export let check = false

	marked.use(mangle())
	marked.use(gfmHeadingId())
</script>

<!--  eslint-disable svelte/no-at-html-tags -->
<div use:fillable={{ options, current, check }} on:remove class="flex-grow">
	{@html marked(text)}
</div>
