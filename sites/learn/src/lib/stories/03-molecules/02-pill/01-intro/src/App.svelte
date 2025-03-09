<script>
	import { Pill, Item } from '@rokkit/elements'
	import { FieldMapper } from '@rokkit/core'

	let message = $state()
	function handleRemove(event) {
		message = JSON.stringify(event.detail, null, 2)
	}
	let mapping = new FieldMapper({ text: 'title' }, { default: Item })
</script>

<span class="flex flex-col items-start gap-2">
	<Pill value="Sample Content" />
	<Pill value="Removable" removable={true} onremove={handleRemove} />
	<Pill
		value={{ text: 'Removable with a heart', icon: 'i-rokkit:heart-filled' }}
		removable={true}
		onremove={handleRemove}
	/>
	<Pill value={{ title: 'Content with mapping' }} {mapping} class="px-10 text-blue-500" />
</span>

Click on the removable Removable to see the remove event details:
<pre>
 {message}
</pre>
