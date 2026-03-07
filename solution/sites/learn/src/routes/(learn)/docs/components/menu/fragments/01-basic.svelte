<script>
	// @ts-nocheck
	import { Menu } from '@rokkit/ui'

	const items = [
		{ label: 'Copy', icon: 'i-lucide:copy' },
		{ label: 'Paste', icon: 'i-lucide:clipboard' },
		{ label: 'Delete', icon: 'i-lucide:trash' }
	]
</script>

<Menu {items} label="Actions" onselect={(value, proxy) => console.log(value, proxy)} />
