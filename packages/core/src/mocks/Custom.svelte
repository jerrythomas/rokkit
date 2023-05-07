<script>
	import { defaultFields } from '../../src/constants'
	export let value
	export let fields = defaultFields
</script>

<span>{value[fields.text]}</span>
