<script>
	import { getText, defaultFields } from '@rokkit/core'
	let { value = $bindable(), fields = defaultFields } = $props()
</script>

<span>{getText(value, fields)}</span>
