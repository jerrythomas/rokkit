<script>
	import { Item } from '@rokkit/molecules'

	let icon = { open: 'i-rokkit:folder-opened', close: 'i-rokkit:folder-closed' }
</script>

<p class="mt-6">State based icons</p>
<item>
	<Item value={{ icon, text: 'Folder Open', state: 'open' }} />
</item>
<item>
	<Item value={{ icon, text: 'Folder Closed', state: 'close' }} />
</item>
