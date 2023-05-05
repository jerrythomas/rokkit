<script>
	import { Switch } from '@rokkit/core'

	let items = [
		{ icon: 'i-rokkit:mode-dark', mode: 'dark' },
		{ icon: 'i-rokkit:mode-light', mode: 'light' }
	]
	let value
</script>

<Switch {items} bind:value />
<p>Selected Value</p>
<pre>{JSON.stringify(value, null, 2)}</pre>
