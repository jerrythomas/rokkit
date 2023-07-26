<script>
	import { getText, defaultFields } from '@rokkit/core'
	export let value
	export let fields = defaultFields
</script>

<span>{getText(value, fields)}</span>
