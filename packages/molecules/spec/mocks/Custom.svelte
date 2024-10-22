<script>
	import { getText, defaultFields } from '@rokkit/core'
	let { value, fields = defaultFields } = $props();
</script>

<span>{getText(value, fields)}</span>
