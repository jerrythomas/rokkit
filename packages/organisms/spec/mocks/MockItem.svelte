<script>
	import { getText } from '@rokkit/core'
	let { value = $bindable({}), fields } = $props()
</script>

<span>{getText(value, fields)}</span>
