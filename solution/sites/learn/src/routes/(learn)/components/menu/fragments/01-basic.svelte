<script>
	// @ts-nocheck
	import { Menu } from '@rokkit/ui'

	const options = [
		{ label: 'Copy', icon: 'i-lucide:copy' },
		{ label: 'Paste', icon: 'i-lucide:clipboard' },
		{ label: 'Delete', icon: 'i-lucide:trash' }
	]
</script>

<Menu {options} label="Actions" onselect={(value, item) => console.log(value, item)} />
