<script>
	import { Item } from '@rokkit/core'

	let folder = {
		text: 'Folder',
		icon: { open: 'i-rokkit:folder-opened', close: 'i-rokkit:folder-closed' },
		state: 'open'
	}
	let avatar = {
		text: 'John Doe',
		image:
			'https://unsplash.com/photos/mjRwhvqEC0U/download?ixid=MnwxMjA3fDB8MXxhbGx8fHx8fHx8fHwxNjgzMzU3Nzcy&force=true&w=200'
	}
</script>

<item>
	<Item value="Sample Text" />
</item>
<item>
	<Item value={{ text: 'A Sun Icon', icon: 'i-rokkit:mode-light-solid' }} />
</item>
<item>
	<Item value={avatar} />
</item>
