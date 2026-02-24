<script>
	import { Pill } from '@rokkit/ui'

	let message = $state()
	function handleRemove(event) {
		message = JSON.stringify(event.detail, null, 2)
	}
</script>

<span class="flex flex-col items-start gap-2">
	<Pill value="Sample Content" />
	<Pill value="Removable" removable={true} onremove={handleRemove} />
	<Pill
		value={{ text: 'Removable with a heart', icon: 'i-rokkit:heart-filled' }}
		removable={true}
		onremove={handleRemove}
	/>
	<Pill value={{ text: 'Content with custom class' }} class="px-10 text-blue-500" />
</span>

Click on the removable Removable to see the remove event details:
<pre>
 {message}
</pre>
