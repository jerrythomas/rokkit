<script>
	// @ts-nocheck
	import { Menu } from '@rokkit/ui'

	const items = [
		{ text: 'Copy', icon: 'i-lucide:copy' },
		{ text: 'Paste', icon: 'i-lucide:clipboard' },
		{ text: 'Delete', icon: 'i-lucide:trash' }
	]
</script>

<Menu {items} label="Actions" onselect={(value, proxy) => console.log(value, proxy)} />
