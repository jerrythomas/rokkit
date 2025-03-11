<script>
	import { Tree } from '@rokkit/ui'
	import { data } from './data.js'

	let items = $state(data)
	let value = $state(null)
</script>

<Tree bind:items bind:value />
