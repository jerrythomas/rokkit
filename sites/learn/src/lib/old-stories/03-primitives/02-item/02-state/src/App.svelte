<script>
	import { Item } from '@rokkit/ui'

	let icon = { open: 'i-rokkit:folder-opened', close: 'i-rokkit:folder-closed' }
</script>

<p class="mt-6">State based icons</p>
<item class="border-neutral-subtle flex w-full gap-2 rounded-md border p-2">
	<Item value={{ icon, text: 'Folder Open', state: 'open' }} />
</item>
<item class="border-neutral-subtle flex w-full gap-2 rounded-md border p-2">
	<Item value={{ icon, text: 'Folder Closed', state: 'close' }} />
</item>
