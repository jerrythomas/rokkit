<script>
	import { Item } from '@rokkit/ui'

	let avatar = {
		text: 'An image',
		image: 'https://images.unsplash.com/photo-1734779205618-30ee0220f56f?q=80&w=100&auto=format'
	}
</script>

<item class="border-neutral-subtle flex items-center gap-2 rounded-md border p-2">
	<Item value="Sample Text" />
</item>
<item class="border-neutral-subtle flex items-center gap-2 rounded-md border p-2">
	<Item value={{ text: 'With Icon', icon: 'i-rokkit:mode-light' }} />
</item>
<item
	class="border-neutral-subtle flex w-full flex-col gap-2 overflow-hidden rounded-md border p-2"
>
	<Item value={avatar} />
</item>
