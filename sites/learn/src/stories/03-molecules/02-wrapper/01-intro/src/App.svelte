<script>
	import { ItemWrapper } from '@rokkit/ui'

	let message
	function handleRemove(event) {
		message = JSON.stringify(event.detail, null, 2)
	}
</script>

<span class="flex flex-col items-start gap-2">
	<ItemWrapper value="Sample Content" />
	<ItemWrapper value="Removable" removable={true} on:remove={handleRemove} />
	<ItemWrapper
		value={{ text: 'Removable with a heart', icon: 'i-rokkit:heart-filled' }}
		removable={true}
		on:remove={handleRemove}
	/>
	<ItemWrapper value={{ title: 'Content with mapping' }} fields={{ text: 'title' }} />
</span>

Click on the removable Removable to see the remove event details:
<pre>
 {message}
</pre>
