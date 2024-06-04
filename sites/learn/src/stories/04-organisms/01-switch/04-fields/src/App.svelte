<script>
	import { Switch } from '@rokkit/ui'
	let options = [
		{ icon: 'i-rokkit:mode-dark', mode: 'dark' },
		{ icon: 'i-rokkit:mode-light', mode: 'light' }
	]
	let fields = {
		text: 'mode'
	}
	let value
</script>

<Switch {options} {fields} bind:value />
<p>Selected Value</p>
<pre>{JSON.stringify(value, null, 2)}</pre>
