<script>
	import { defaultFields } from '../../src/constants'
	export let content
	export let fields = defaultFields
</script>

<span>{content[fields.text]}</span>
